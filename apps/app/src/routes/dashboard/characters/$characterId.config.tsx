import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBotConfig, useUpdateBotConfig } from "@/hooks/use-bot-config";
import { useCharacter } from "@/hooks/use-characters";
import { useRealtimeSession } from "@/hooks/use-realtime";
import type {
  BotConfig,
  GeneralConfig,
  HardwareConfig,
  HealingConfig,
  HealingPotionConfig,
  HealingSpellConfig,
  ReconnectConfig,
  RefillConfig,
  ServerSaveConfig,
  SpellAttackConfig,
  SpellAttackGroup,
  TargetingConfig,
} from "@/types";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Cpu,
  Heart,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Swords,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const Route = createFileRoute(
  "/dashboard/characters/$characterId/config"
)({
  component: BotConfigPage,
});

// ---------------------------------------------------------------------------
// Default config values (mirrors Python defaults.py)
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: BotConfig = {
  healing: {
    healthPotion: {
      enabled: true,
      threshold: 30,
      hotkey: "1",
      cooldown: 1.0,
    },
    manaPotion: {
      enabled: true,
      threshold: 50,
      hotkey: "2",
      cooldown: 1.0,
    },
    spells: [
      {
        name: "Emergency Heal",
        enabled: true,
        threshold: 20,
        spell: "exura vita",
        hotkey: "F1",
        minMana: 10,
      },
      {
        name: "Strong Heal",
        enabled: true,
        threshold: 40,
        spell: "exura gran",
        hotkey: "F2",
        minMana: 10,
      },
      {
        name: "Light Heal",
        enabled: true,
        threshold: 70,
        spell: "exura",
        hotkey: "F3",
        minMana: 10,
      },
    ],
    food: { enabled: true, threshold: 5, hotkey: "f", cooldown: 2.0 },
  },
  cavebot: { routeFile: "", startWaypoint: 0, loop: true },
  refill: {
    city: "Darashia",
    hpPotionMin: 50,
    mpPotionMin: 100,
    capMin: 200,
    checkCapacity: true,
    hpPotionTarget: 200,
    mpPotionTarget: 400,
    depositGold: true,
    depositLoot: true,
    dropFlasks: true,
    lootBackpack: "Beach Backpack",
    mainBackpack: "Golden Backpack",
    stashBackpack: "Beach Backpack",
    depotChest: 1,
    returnLabel: "caveStart",
  },
  general: {
    tickRate: 0.1,
    enableHealing: true,
    enableCavebot: true,
    enableLoot: true,
    lootHotkey: "g",
    stuckAlertTimeout: 120,
    enableStuckAlert: true,
    enableLogging: false,
    window: "",
  },
  targeting: { enabled: true, mode: "all", whitelist: [], blacklist: [] },
  spellAttack: { enabled: false, manaReservePercent: 30, groups: [] },
  reconnect: {
    enabled: false,
    email: "",
    password: "",
    maxRetries: 10,
    delayBetweenRetries: 5.0,
  },
  hardware: { mode: "software", arduinoPort: "", captureDevice: 0 },
  serverSave: {
    enabled: true,
    time: "10:00",
    windowMinutes: 5,
    waitAfterKickSeconds: 90,
  },
};

const REFILL_CITIES = [
  "Darashia",
  "Thais",
  "Venore",
  "Carlin",
  "Ab'dendriel",
  "Edron",
  "Svargrond",
  "Port Hope",
  "Liberty Bay",
  "Ankrahmun",
  "Yalahar",
  "Roshamuul",
];

// ---------------------------------------------------------------------------
// Inline reusable components
// ---------------------------------------------------------------------------

function ConfigToggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-2"
    >
      {label && <span className="text-sm text-slate-300">{label}</span>}
      <div
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-700"}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${enabled ? "left-[22px]" : "left-0.5"}`}
        />
      </div>
    </button>
  );
}

function ConfigSlider({
  value,
  onChange,
  min,
  max,
  step,
  label,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-slate-300">{label}</Label>
        <span className="text-sm font-mono text-emerald-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-emerald-500 transition-all duration-300"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function ConfigInput({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-slate-800/80 border-slate-700 focus:ring-emerald-500/50 text-white placeholder:text-slate-500"
      />
    </div>
  );
}

function ConfigNumberInput({
  value,
  onChange,
  label,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="bg-slate-800/80 border-slate-700 focus:ring-emerald-500/50 text-white"
      />
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`bg-slate-900/50 border-slate-800 animate-fade-in ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ChipInput({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (item: string) => {
    onChange(items.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-slate-800/80 border-slate-700 focus:ring-emerald-500/50 text-white placeholder:text-slate-500"
        />
        <Button
          type="button"
          onClick={handleAdd}
          size="icon"
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item}
              className="bg-slate-800 text-slate-200 border-slate-700 pl-3 pr-1.5 py-1 gap-1.5"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function PotionCard({
  title,
  potion,
  onChange,
}: {
  title: string;
  potion: HealingPotionConfig;
  onChange: (p: HealingPotionConfig) => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{title}</span>
        <ConfigToggle
          enabled={potion.enabled ?? true}
          onChange={(v) => onChange({ ...potion, enabled: v })}
        />
      </div>
      <ConfigSlider
        label="HP Threshold"
        value={potion.threshold ?? 30}
        onChange={(v) => onChange({ ...potion, threshold: v })}
        min={0}
        max={100}
        step={1}
        unit="%"
      />
      <div className="grid grid-cols-2 gap-3">
        <ConfigInput
          label="Hotkey"
          value={potion.hotkey ?? ""}
          onChange={(v) => onChange({ ...potion, hotkey: v })}
          placeholder="e.g. 1"
        />
        <ConfigSlider
          label="Cooldown"
          value={potion.cooldown ?? 1.0}
          onChange={(v) => onChange({ ...potion, cooldown: v })}
          min={0.1}
          max={5.0}
          step={0.1}
          unit="s"
        />
      </div>
    </div>
  );
}

function SpellRow({
  spell,
  onChange,
  onRemove,
}: {
  spell: HealingSpellConfig;
  onChange: (s: HealingSpellConfig) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ConfigToggle
            enabled={spell.enabled ?? true}
            onChange={(v) => onChange({ ...spell, enabled: v })}
          />
          <Input
            value={spell.name ?? ""}
            onChange={(e) => onChange({ ...spell, name: e.target.value })}
            placeholder="Spell name"
            className="bg-slate-800/80 border-slate-700 focus:ring-emerald-500/50 text-white w-40"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ConfigInput
          label="Spell"
          value={spell.spell ?? ""}
          onChange={(v) => onChange({ ...spell, spell: v })}
          placeholder="exura vita"
        />
        <ConfigInput
          label="Hotkey"
          value={spell.hotkey ?? ""}
          onChange={(v) => onChange({ ...spell, hotkey: v })}
          placeholder="F1"
        />
        <ConfigSlider
          label="Threshold"
          value={spell.threshold ?? 50}
          onChange={(v) => onChange({ ...spell, threshold: v })}
          min={0}
          max={100}
          step={1}
          unit="%"
        />
        <ConfigNumberInput
          label="Min Mana"
          value={spell.minMana ?? 10}
          onChange={(v) => onChange({ ...spell, minMana: v })}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
}

function HealingSection({
  healing,
  onChange,
}: {
  healing: HealingConfig;
  onChange: (h: HealingConfig) => void;
}) {
  const healthPotion = healing.healthPotion ?? DEFAULT_CONFIG.healing!.healthPotion!;
  const manaPotion = healing.manaPotion ?? DEFAULT_CONFIG.healing!.manaPotion!;
  const spells = healing.spells ?? DEFAULT_CONFIG.healing!.spells!;
  const food = healing.food ?? DEFAULT_CONFIG.healing!.food!;

  const handleAddSpell = () => {
    onChange({
      ...healing,
      spells: [
        ...spells,
        {
          name: "New Spell",
          enabled: true,
          threshold: 50,
          spell: "",
          hotkey: "",
          minMana: 10,
        },
      ],
    });
  };

  const handleUpdateSpell = (index: number, spell: HealingSpellConfig) => {
    const updated = [...spells];
    updated[index] = spell;
    onChange({ ...healing, spells: updated });
  };

  const handleRemoveSpell = (index: number) => {
    onChange({ ...healing, spells: spells.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          title="Health Potion"
          icon={<Heart className="h-4 w-4 text-red-400" />}
        >
          <PotionCard
            title="Health Potion"
            potion={healthPotion}
            onChange={(p) => onChange({ ...healing, healthPotion: p })}
          />
        </SectionCard>

        <SectionCard
          title="Mana Potion"
          icon={<Zap className="h-4 w-4 text-blue-400" />}
        >
          <PotionCard
            title="Mana Potion"
            potion={manaPotion}
            onChange={(p) => onChange({ ...healing, manaPotion: p })}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Healing Spells"
        icon={<Heart className="h-4 w-4 text-emerald-400" />}
      >
        <div className="space-y-3">
          {spells.map((spell, index) => (
            <SpellRow
              key={`spell-${index}`}
              spell={spell}
              onChange={(s) => handleUpdateSpell(index, s)}
              onRemove={() => handleRemoveSpell(index)}
            />
          ))}
          <Button
            type="button"
            onClick={handleAddSpell}
            variant="outline"
            className="w-full border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Spell
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Food"
        icon={<Package className="h-4 w-4 text-amber-400" />}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-300">Auto Eat</span>
          <ConfigToggle
            enabled={food.enabled ?? true}
            onChange={(v) => onChange({ ...healing, food: { ...food, enabled: v } })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConfigSlider
            label="Threshold"
            value={food.threshold ?? 5}
            onChange={(v) =>
              onChange({ ...healing, food: { ...food, threshold: v } })
            }
            min={0}
            max={30}
            step={1}
            unit=" min"
          />
          <ConfigInput
            label="Hotkey"
            value={food.hotkey ?? "f"}
            onChange={(v) =>
              onChange({ ...healing, food: { ...food, hotkey: v } })
            }
            placeholder="f"
          />
          <ConfigSlider
            label="Cooldown"
            value={food.cooldown ?? 2.0}
            onChange={(v) =>
              onChange({ ...healing, food: { ...food, cooldown: v } })
            }
            min={0.5}
            max={10.0}
            step={0.5}
            unit="s"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function TargetingSection({
  targeting,
  onChange,
}: {
  targeting: TargetingConfig;
  onChange: (t: TargetingConfig) => void;
}) {
  const mode = targeting.mode ?? "all";
  const whitelist = targeting.whitelist ?? [];
  const blacklist = targeting.blacklist ?? [];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Targeting"
        icon={<Target className="h-4 w-4 text-rose-400" />}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">Enable Targeting</span>
          <ConfigToggle
            enabled={targeting.enabled ?? true}
            onChange={(v) => onChange({ ...targeting, enabled: v })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Mode</Label>
          <div className="flex gap-2">
            {(["all", "whitelist", "blacklist"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ ...targeting, mode: m })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  mode === m
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {mode === "whitelist" && (
          <div className="space-y-2 mt-4">
            <Label className="text-slate-300">Whitelisted Creatures</Label>
            <ChipInput
              items={whitelist}
              onChange={(items) => onChange({ ...targeting, whitelist: items })}
              placeholder="Add creature name..."
            />
          </div>
        )}

        {mode === "blacklist" && (
          <div className="space-y-2 mt-4">
            <Label className="text-slate-300">Blacklisted Creatures</Label>
            <ChipInput
              items={blacklist}
              onChange={(items) => onChange({ ...targeting, blacklist: items })}
              placeholder="Add creature name..."
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function SpellAttackGroupRow({
  group,
  onChange,
  onRemove,
}: {
  group: SpellAttackGroup;
  onChange: (g: SpellAttackGroup) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ConfigToggle
            enabled={group.enabled ?? true}
            onChange={(v) => onChange({ ...group, enabled: v })}
          />
          <Input
            value={group.name ?? ""}
            onChange={(e) => onChange({ ...group, name: e.target.value })}
            placeholder="Group name"
            className="bg-slate-800/80 border-slate-700 focus:ring-emerald-500/50 text-white w-40"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ConfigInput
          label="Spell"
          value={group.spell ?? ""}
          onChange={(v) => onChange({ ...group, spell: v })}
          placeholder="exori"
        />
        <ConfigInput
          label="Hotkey"
          value={group.hotkey ?? ""}
          onChange={(v) => onChange({ ...group, hotkey: v })}
          placeholder="F5"
        />
        <ConfigNumberInput
          label="Min Mana"
          value={group.minMana ?? 10}
          onChange={(v) => onChange({ ...group, minMana: v })}
          min={0}
          max={100}
          step={1}
        />
        <ConfigSlider
          label="Cooldown"
          value={group.cooldown ?? 2.0}
          onChange={(v) => onChange({ ...group, cooldown: v })}
          min={0.1}
          max={10.0}
          step={0.1}
          unit="s"
        />
      </div>
    </div>
  );
}

function SpellAttackSection({
  spellAttack,
  onChange,
}: {
  spellAttack: SpellAttackConfig;
  onChange: (s: SpellAttackConfig) => void;
}) {
  const groups = spellAttack.groups ?? [];

  const handleAddGroup = () => {
    onChange({
      ...spellAttack,
      groups: [
        ...groups,
        {
          name: "New Group",
          enabled: true,
          spell: "",
          hotkey: "",
          minMana: 10,
          cooldown: 2.0,
        },
      ],
    });
  };

  const handleUpdateGroup = (index: number, group: SpellAttackGroup) => {
    const updated = [...groups];
    updated[index] = group;
    onChange({ ...spellAttack, groups: updated });
  };

  const handleRemoveGroup = (index: number) => {
    onChange({
      ...spellAttack,
      groups: groups.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Spell Attack"
        icon={<Swords className="h-4 w-4 text-orange-400" />}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">Enable Spell Attack</span>
          <ConfigToggle
            enabled={spellAttack.enabled ?? false}
            onChange={(v) => onChange({ ...spellAttack, enabled: v })}
          />
        </div>

        <ConfigSlider
          label="Mana Reserve"
          value={spellAttack.manaReservePercent ?? 30}
          onChange={(v) =>
            onChange({ ...spellAttack, manaReservePercent: v })
          }
          min={0}
          max={100}
          step={1}
          unit="%"
        />
      </SectionCard>

      <SectionCard
        title="Spell Groups"
        icon={<Zap className="h-4 w-4 text-yellow-400" />}
      >
        <div className="space-y-3">
          {groups.map((group, index) => (
            <SpellAttackGroupRow
              key={`group-${index}`}
              group={group}
              onChange={(g) => handleUpdateGroup(index, g)}
              onRemove={() => handleRemoveGroup(index)}
            />
          ))}
          <Button
            type="button"
            onClick={handleAddGroup}
            variant="outline"
            className="w-full border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Spell Group
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function RefillSection({
  refill,
  onChange,
}: {
  refill: RefillConfig;
  onChange: (r: RefillConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Refill City"
        icon={<Package className="h-4 w-4 text-cyan-400" />}
      >
        <div className="space-y-2">
          <Label className="text-slate-300">City</Label>
          <Select
            value={refill.city ?? "Darashia"}
            onValueChange={(v) => onChange({ ...refill, city: v })}
          >
            <SelectTrigger className="bg-slate-800/80 border-slate-700 text-white">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {REFILL_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <SectionCard
        title="Potion Thresholds"
        icon={<Heart className="h-4 w-4 text-red-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigNumberInput
            label="HP Potion Min"
            value={refill.hpPotionMin ?? 50}
            onChange={(v) => onChange({ ...refill, hpPotionMin: v })}
            min={0}
            step={10}
          />
          <ConfigNumberInput
            label="HP Potion Target"
            value={refill.hpPotionTarget ?? 200}
            onChange={(v) => onChange({ ...refill, hpPotionTarget: v })}
            min={0}
            step={10}
          />
          <ConfigNumberInput
            label="MP Potion Min"
            value={refill.mpPotionMin ?? 100}
            onChange={(v) => onChange({ ...refill, mpPotionMin: v })}
            min={0}
            step={10}
          />
          <ConfigNumberInput
            label="MP Potion Target"
            value={refill.mpPotionTarget ?? 400}
            onChange={(v) => onChange({ ...refill, mpPotionTarget: v })}
            min={0}
            step={10}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Capacity & Deposit"
        icon={<Package className="h-4 w-4 text-amber-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigNumberInput
            label="Min Capacity"
            value={refill.capMin ?? 200}
            onChange={(v) => onChange({ ...refill, capMin: v })}
            min={0}
            step={50}
          />
          <ConfigNumberInput
            label="Depot Chest"
            value={refill.depotChest ?? 1}
            onChange={(v) => onChange({ ...refill, depotChest: v })}
            min={1}
            max={18}
            step={1}
          />
        </div>
        <div className="flex flex-wrap gap-6 pt-2">
          <ConfigToggle
            label="Check Capacity"
            enabled={refill.checkCapacity ?? true}
            onChange={(v) => onChange({ ...refill, checkCapacity: v })}
          />
          <ConfigToggle
            label="Deposit Gold"
            enabled={refill.depositGold ?? true}
            onChange={(v) => onChange({ ...refill, depositGold: v })}
          />
          <ConfigToggle
            label="Deposit Loot"
            enabled={refill.depositLoot ?? true}
            onChange={(v) => onChange({ ...refill, depositLoot: v })}
          />
          <ConfigToggle
            label="Drop Flasks"
            enabled={refill.dropFlasks ?? true}
            onChange={(v) => onChange({ ...refill, dropFlasks: v })}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Backpacks"
        icon={<Package className="h-4 w-4 text-purple-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigInput
            label="Main Backpack"
            value={refill.mainBackpack ?? "Golden Backpack"}
            onChange={(v) => onChange({ ...refill, mainBackpack: v })}
            placeholder="Golden Backpack"
          />
          <ConfigInput
            label="Loot Backpack"
            value={refill.lootBackpack ?? "Beach Backpack"}
            onChange={(v) => onChange({ ...refill, lootBackpack: v })}
            placeholder="Beach Backpack"
          />
          <ConfigInput
            label="Stash Backpack"
            value={refill.stashBackpack ?? "Beach Backpack"}
            onChange={(v) => onChange({ ...refill, stashBackpack: v })}
            placeholder="Beach Backpack"
          />
          <ConfigInput
            label="Return Label"
            value={refill.returnLabel ?? "caveStart"}
            onChange={(v) => onChange({ ...refill, returnLabel: v })}
            placeholder="caveStart"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function GeneralSection({
  general,
  onChange,
}: {
  general: GeneralConfig;
  onChange: (g: GeneralConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Performance"
        icon={<Settings className="h-4 w-4 text-slate-400" />}
      >
        <ConfigSlider
          label="Tick Rate"
          value={Math.round((general.tickRate ?? 0.1) * 1000)}
          onChange={(v) => onChange({ ...general, tickRate: v / 1000 })}
          min={50}
          max={200}
          step={10}
          unit="ms"
        />
      </SectionCard>

      <SectionCard
        title="Module Toggles"
        icon={<Zap className="h-4 w-4 text-emerald-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-sm text-slate-300">Healing</span>
            <ConfigToggle
              enabled={general.enableHealing ?? true}
              onChange={(v) => onChange({ ...general, enableHealing: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-sm text-slate-300">Cavebot</span>
            <ConfigToggle
              enabled={general.enableCavebot ?? true}
              onChange={(v) => onChange({ ...general, enableCavebot: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-sm text-slate-300">Loot</span>
            <ConfigToggle
              enabled={general.enableLoot ?? true}
              onChange={(v) => onChange({ ...general, enableLoot: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-sm text-slate-300">Stuck Alert</span>
            <ConfigToggle
              enabled={general.enableStuckAlert ?? true}
              onChange={(v) => onChange({ ...general, enableStuckAlert: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-sm text-slate-300">Logging</span>
            <ConfigToggle
              enabled={general.enableLogging ?? false}
              onChange={(v) => onChange({ ...general, enableLogging: v })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Hotkeys & Alerts"
        icon={<Settings className="h-4 w-4 text-amber-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigInput
            label="Loot Hotkey"
            value={general.lootHotkey ?? "g"}
            onChange={(v) => onChange({ ...general, lootHotkey: v })}
            placeholder="g"
          />
          <ConfigNumberInput
            label="Stuck Alert Timeout"
            value={general.stuckAlertTimeout ?? 120}
            onChange={(v) => onChange({ ...general, stuckAlertTimeout: v })}
            min={30}
            max={600}
            step={10}
          />
          <div className="md:col-span-2">
            <ConfigInput
              label="Window Title"
              value={general.window ?? ""}
              onChange={(v) => onChange({ ...general, window: v })}
              placeholder="Tibia - Character Name"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ReconnectSection({
  reconnect,
  onChange,
}: {
  reconnect: ReconnectConfig;
  onChange: (r: ReconnectConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Auto Reconnect"
        icon={<RefreshCw className="h-4 w-4 text-blue-400" />}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">Enable Reconnect</span>
          <ConfigToggle
            enabled={reconnect.enabled ?? false}
            onChange={(v) => onChange({ ...reconnect, enabled: v })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigInput
            label="Email"
            value={reconnect.email ?? ""}
            onChange={(v) => onChange({ ...reconnect, email: v })}
            placeholder="your@email.com"
            type="email"
          />
          <ConfigInput
            label="Password"
            value={reconnect.password ?? ""}
            onChange={(v) => onChange({ ...reconnect, password: v })}
            placeholder="********"
            type="password"
          />
          <ConfigNumberInput
            label="Max Retries"
            value={reconnect.maxRetries ?? 10}
            onChange={(v) => onChange({ ...reconnect, maxRetries: v })}
            min={1}
            max={50}
            step={1}
          />
          <ConfigSlider
            label="Delay Between Retries"
            value={reconnect.delayBetweenRetries ?? 5.0}
            onChange={(v) =>
              onChange({ ...reconnect, delayBetweenRetries: v })
            }
            min={1.0}
            max={30.0}
            step={0.5}
            unit="s"
          />
        </div>
      </SectionCard>
    </div>
  );
}

function ServerSaveSection({
  serverSave,
  onChange,
}: {
  serverSave: ServerSaveConfig;
  onChange: (s: ServerSaveConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Server Save"
        icon={<Clock className="h-4 w-4 text-yellow-400" />}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">
            Enable Server Save Protection
          </span>
          <ConfigToggle
            enabled={serverSave.enabled ?? true}
            onChange={(v) => onChange({ ...serverSave, enabled: v })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConfigInput
            label="Server Save Time"
            value={serverSave.time ?? "10:00"}
            onChange={(v) => onChange({ ...serverSave, time: v })}
            placeholder="10:00"
            type="time"
          />
          <ConfigNumberInput
            label="Window (minutes)"
            value={serverSave.windowMinutes ?? 5}
            onChange={(v) => onChange({ ...serverSave, windowMinutes: v })}
            min={1}
            max={30}
            step={1}
          />
          <ConfigNumberInput
            label="Wait After Kick (seconds)"
            value={serverSave.waitAfterKickSeconds ?? 90}
            onChange={(v) =>
              onChange({ ...serverSave, waitAfterKickSeconds: v })
            }
            min={30}
            max={300}
            step={10}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function HardwareSection({
  hardware,
  onChange,
}: {
  hardware: HardwareConfig;
  onChange: (h: HardwareConfig) => void;
}) {
  const mode = hardware.mode ?? "software";

  return (
    <div className="space-y-6">
      <SectionCard
        title="Hardware Configuration"
        icon={<Cpu className="h-4 w-4 text-violet-400" />}
      >
        <div className="space-y-2 mb-4">
          <Label className="text-slate-300">Input Mode</Label>
          <div className="flex gap-2">
            {(["software", "arduino"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ ...hardware, mode: m })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  mode === m
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigInput
            label="Arduino Port"
            value={hardware.arduinoPort ?? ""}
            onChange={(v) => onChange({ ...hardware, arduinoPort: v })}
            placeholder="/dev/ttyUSB0"
          />
          <ConfigNumberInput
            label="Capture Device"
            value={hardware.captureDevice ?? 0}
            onChange={(v) => onChange({ ...hardware, captureDevice: v })}
            min={0}
            max={10}
            step={1}
          />
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

function BotConfigPage() {
  const { characterId } = Route.useParams();
  const { data: character, isLoading: isLoadingCharacter } =
    useCharacter(characterId);
  const { data: configData, isLoading: isLoadingConfig } =
    useBotConfig(characterId);
  const updateConfig = useUpdateBotConfig(characterId);

  const [config, setConfig] = useState<BotConfig>(
    structuredClone(DEFAULT_CONFIG)
  );
  const [savedVersion, setSavedVersion] = useState(0);

  const sessionId = character?.activeSessionId ?? "";
  const { configAckVersion, isConnected } = useRealtimeSession(sessionId);

  useEffect(() => {
    if (!configData) return;
    setConfig(structuredClone(configData.config));
    setSavedVersion(configData.version);
  }, [configData]);

  const updateSection = useCallback(
    <K extends keyof BotConfig>(section: K, value: BotConfig[K]) => {
      setConfig((prev) => ({ ...prev, [section]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    updateConfig.mutate(config, {
      onSuccess: (data) => setSavedVersion(data.version),
    });
  }, [config, updateConfig]);

  const handleReset = useCallback(() => {
    if (!configData) return;
    setConfig(structuredClone(configData.config));
  }, [configData]);

  const isSynced =
    configAckVersion != null && configAckVersion >= savedVersion;
  const hasChanges = useMemo(
    () =>
      JSON.stringify(config) !== JSON.stringify(configData?.config ?? {}),
    [config, configData]
  );

  if (isLoadingCharacter || isLoadingConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Character not found</p>
        <Link to="/dashboard/characters">
          <Button variant="outline" className="mt-4 border-slate-700">
            Back to Characters
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/characters/$characterId"
            params={{ characterId }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {character.name}
              </h1>
              {character.hasActiveSession && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                  ONLINE
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">Bot Configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && savedVersion > 0 && (
            <Badge
              className={
                isSynced
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse-glow"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }
            >
              {isSynced ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Synced
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Pending...
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="healing" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
          {[
            { value: "healing", label: "Healing", icon: Heart },
            { value: "targeting", label: "Targeting", icon: Target },
            { value: "attack", label: "Attack", icon: Swords },
            { value: "refill", label: "Refill", icon: Package },
            { value: "general", label: "General", icon: Settings },
            { value: "reconnect", label: "Reconnect", icon: RefreshCw },
            { value: "serverSave", label: "Server Save", icon: Clock },
            { value: "hardware", label: "Hardware", icon: Cpu },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-300 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-[0_0_10px_rgba(16,185,129,0.1)] data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-300"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="healing">
            <HealingSection
              healing={config.healing ?? DEFAULT_CONFIG.healing!}
              onChange={(h) => updateSection("healing", h)}
            />
          </TabsContent>

          <TabsContent value="targeting">
            <TargetingSection
              targeting={config.targeting ?? DEFAULT_CONFIG.targeting!}
              onChange={(t) => updateSection("targeting", t)}
            />
          </TabsContent>

          <TabsContent value="attack">
            <SpellAttackSection
              spellAttack={
                config.spellAttack ?? DEFAULT_CONFIG.spellAttack!
              }
              onChange={(s) => updateSection("spellAttack", s)}
            />
          </TabsContent>

          <TabsContent value="refill">
            <RefillSection
              refill={config.refill ?? DEFAULT_CONFIG.refill!}
              onChange={(r) => updateSection("refill", r)}
            />
          </TabsContent>

          <TabsContent value="general">
            <GeneralSection
              general={config.general ?? DEFAULT_CONFIG.general!}
              onChange={(g) => updateSection("general", g)}
            />
          </TabsContent>

          <TabsContent value="reconnect">
            <ReconnectSection
              reconnect={config.reconnect ?? DEFAULT_CONFIG.reconnect!}
              onChange={(r) => updateSection("reconnect", r)}
            />
          </TabsContent>

          <TabsContent value="serverSave">
            <ServerSaveSection
              serverSave={
                config.serverSave ?? DEFAULT_CONFIG.serverSave!
              }
              onChange={(s) => updateSection("serverSave", s)}
            />
          </TabsContent>

          <TabsContent value="hardware">
            <HardwareSection
              hardware={config.hardware ?? DEFAULT_CONFIG.hardware!}
              onChange={(h) => updateSection("hardware", h)}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="text-sm text-slate-400">
            {hasChanges ? (
              <span className="text-amber-400">Unsaved changes</span>
            ) : (
              <span>No changes</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateConfig.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium disabled:opacity-40 transition-all duration-300"
            >
              {updateConfig.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
