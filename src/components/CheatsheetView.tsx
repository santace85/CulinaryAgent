import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  GripVertical,
  NotebookPen,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  StickyNote,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import {
  CheatsheetCard,
  CheatsheetData,
  getStoredCheatsheetData,
  getStoredCheatsheetNotes,
  saveCheatsheetData,
} from "../utils/storage";
import "./CheatsheetView.css";

const DEFAULT_CARDS: CheatsheetCard[] = [
  {
    id: "beef-rare",
    title: "Rare",
    group: "Beef steak",
    value: "120-125°F / 49-52°C",
    detail: "Approximate pull temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "beef-medium-rare",
    title: "Medium rare",
    group: "Beef steak",
    value: "130-135°F / 54-57°C",
    detail: "Approximate pull temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "beef-medium",
    title: "Medium",
    group: "Beef steak",
    value: "140-145°F / 60-63°C",
    detail: "Approximate pull temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "beef-medium-well",
    title: "Medium well",
    group: "Beef steak",
    value: "150-155°F / 66-68°C",
    detail: "Approximate pull temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "beef-well-done",
    title: "Well done",
    group: "Beef steak",
    value: "160°F+ / 71°C+",
    detail: "Approximate pull temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-whole-cuts",
    title: "Whole cuts",
    group: "Food safety",
    value: "145°F / 63°C",
    detail: "USDA minimum; rest for 3 minutes",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-ground-meats",
    title: "Ground meats",
    group: "Food safety",
    value: "160°F / 71°C",
    detail: "USDA minimum internal temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-poultry",
    title: "Poultry",
    group: "Food safety",
    value: "165°F / 74°C",
    detail: "USDA minimum internal temperature",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-fish",
    title: "Fish & shellfish",
    group: "Food safety",
    value: "145°F / 63°C",
    detail: "USDA minimum; flesh should be opaque and separate easily",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-egg-dishes",
    title: "Egg dishes",
    group: "Food safety",
    value: "160°F / 71°C",
    detail: "Casseroles and dishes containing eggs",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-leftovers",
    title: "Leftovers & casseroles",
    group: "Food safety",
    value: "165°F / 74°C",
    detail: "Reheat thoroughly before serving",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-hot-holding",
    title: "Hot holding",
    group: "Storage & timing",
    value: "140°F / 60°C or above",
    detail: "Keep hot food hot while serving",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-refrigerator",
    title: "Refrigerator",
    group: "Storage & timing",
    value: "40°F / 4°C or below",
    detail: "Keep perishable food refrigerated",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-freezer",
    title: "Freezer",
    group: "Storage & timing",
    value: "0°F / -18°C or below",
    detail: "For best quality, keep continuously frozen",
    kind: "temperature",
    isDefault: true,
  },
  {
    id: "safety-leftover-storage",
    title: "Refrigerated leftovers",
    group: "Storage & timing",
    value: "3-4 days",
    detail: "Refrigerate within 2 hours, or 1 hour above 90°F / 32°C",
    kind: "note",
    isDefault: true,
  },
  {
    id: "safety-thawing",
    title: "Safe thawing",
    group: "Storage & timing",
    value: "Fridge, cold water, or microwave",
    detail: "Do not thaw perishable food on the counter",
    kind: "note",
    isDefault: true,
  },
];

const DEFAULT_GROUPS = ["Beef steak", "Food safety", "Storage & timing"];
const NEW_SAFETY_DEFAULT_IDS = [
  "safety-fish",
  "safety-egg-dishes",
  "safety-leftovers",
  "safety-hot-holding",
  "safety-refrigerator",
  "safety-freezer",
  "safety-leftover-storage",
  "safety-thawing",
];
const GROUP_COLOR_SWATCHES = [
  "#38bdf8",
  "#f472b6",
  "#a3e635",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#2dd4bf",
  "#fb923c",
];

interface CardDraft {
  title: string;
  group: string;
  value: string;
  detail: string;
  kind: "temperature" | "note";
}

const emptyDraft = (): CardDraft => ({
  title: "",
  group: "Beef steak",
  value: "",
  detail: "",
  kind: "temperature",
});

function createInitialData(): CheatsheetData {
  const stored = getStoredCheatsheetData();
  if (stored) {
    const existingIds = new Set(stored.cards.map((card) => card.id));
    const removedIds = new Set(stored.removedDefaultIds ?? []);
    const migratedCards = DEFAULT_CARDS.filter(
      (card) =>
        NEW_SAFETY_DEFAULT_IDS.includes(card.id) &&
        !existingIds.has(card.id) &&
        !removedIds.has(card.id),
    );
    return {
      cards: [...stored.cards, ...migratedCards],
      groupOrder: Array.from(
        new Set([
          ...stored.groupOrder,
          ...migratedCards.map((card) => card.group),
          ...stored.cards.map((card) => card.group),
        ]),
      ),
      groupColors: stored.groupColors ?? {},
      removedDefaultIds: stored.removedDefaultIds ?? [],
    };
  }

  const oldNotes = getStoredCheatsheetNotes().map((note) => ({
    id: note.id,
    title: note.title || "Kitchen note",
    group: "My notes",
    value: "",
    detail: note.content,
    kind: "note" as const,
  }));

  return {
    cards: [...DEFAULT_CARDS, ...oldNotes],
    groupOrder: [...DEFAULT_GROUPS, ...(oldNotes.length ? ["My notes"] : [])],
    groupColors: {},
    removedDefaultIds: [],
  };
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const CheatsheetView: React.FC = () => {
  const [data, setData] = useState<CheatsheetData>(createInitialData);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [draft, setDraft] = useState<CardDraft>(emptyDraft);
  const [groupDraft, setGroupDraft] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CheatsheetCard | null>(null);

  useEffect(() => {
    saveCheatsheetData(data);
  }, [data]);

  useEffect(() => {
    if (!selectedCard) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCard(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard]);

  const groups = Array.from(
    new Set([...data.groupOrder, ...data.cards.map((card) => card.group)]),
  );

  const getGroupColor = (group: string) => {
    const savedColor = data.groupColors?.[group];
    if (savedColor) return savedColor;
    const index =
      Math.max(0, groups.indexOf(group)) % GROUP_COLOR_SWATCHES.length;
    return GROUP_COLOR_SWATCHES[index];
  };

  const setGroupColor = (group: string, color: string) => {
    setData((current) => ({
      ...current,
      groupColors: { ...current.groupColors, [group]: color },
    }));
  };

  const updateCard = (id: string, patch: Partial<CheatsheetCard>) => {
    setData((current) => ({
      ...current,
      cards: current.cards.map((card) =>
        card.id === id ? { ...card, ...patch } : card,
      ),
    }));
  };

  const addCard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    const group = draft.group.trim() || "Unsorted";
    const card: CheatsheetCard = {
      id: newId("card"),
      title,
      group,
      value: draft.kind === "temperature" ? draft.value.trim() : "",
      detail: draft.detail.trim(),
      kind: draft.kind,
    };
    setData((current) => ({
      cards: [...current.cards, card],
      groupOrder: current.groupOrder.includes(group)
        ? current.groupOrder
        : [...current.groupOrder, group],
    }));
    setDraft(emptyDraft());
    setShowCardForm(false);
  };

  const addGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = groupDraft.trim();
    if (!name) return;
    setData((current) => ({
      ...current,
      groupOrder: current.groupOrder.includes(name)
        ? current.groupOrder
        : [...current.groupOrder, name],
    }));
    setGroupDraft("");
    setShowGroupForm(false);
  };

  const deleteCard = (id: string) => {
    setData((current) => {
      const card = current.cards.find((item) => item.id === id);
      return {
        ...current,
        cards: current.cards.filter((item) => item.id !== id),
        removedDefaultIds:
          card?.isDefault && !current.removedDefaultIds?.includes(id)
            ? [...(current.removedDefaultIds ?? []), id]
            : current.removedDefaultIds,
      };
    });
    if (editingCardId === id) setEditingCardId(null);
  };

  const moveCardTo = (id: string, targetGroup: string, beforeId?: string) => {
    setData((current) => {
      const card = current.cards.find((item) => item.id === id);
      if (!card || id === beforeId) return current;
      const remaining = current.cards.filter((item) => item.id !== id);
      const moved = { ...card, group: targetGroup };
      let insertAt = beforeId
        ? remaining.findIndex((item) => item.id === beforeId)
        : -1;
      if (insertAt < 0) {
        const lastInGroup = remaining.reduce(
          (last, item, index) => (item.group === targetGroup ? index : last),
          -1,
        );
        insertAt = lastInGroup < 0 ? remaining.length : lastInGroup + 1;
      }
      remaining.splice(insertAt, 0, moved);
      return {
        cards: remaining,
        groupOrder: current.groupOrder.includes(targetGroup)
          ? current.groupOrder
          : [...current.groupOrder, targetGroup],
      };
    });
  };

  const moveCardWithinGroup = (
    groupCards: CheatsheetCard[],
    index: number,
    delta: number,
  ) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= groupCards.length) return;
    const target =
      delta < 0 ? groupCards[nextIndex].id : groupCards[nextIndex + 1]?.id;
    moveCardTo(groupCards[index].id, groupCards[index].group, target);
  };

  const moveGroup = (group: string, delta: number) => {
    setData((current) => {
      const order = Array.from(
        new Set([
          ...current.groupOrder,
          ...current.cards.map((card) => card.group),
        ]),
      );
      const from = order.indexOf(group);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= order.length) return current;
      [order[from], order[to]] = [order[to], order[from]];
      return { ...current, groupOrder: order };
    });
  };

  const renameGroup = (oldName: string) => {
    const name = groupNameDraft.trim();
    if (name && name !== oldName) {
      setData((current) => ({
        groupOrder: current.groupOrder.map((group) =>
          group === oldName ? name : group,
        ),
        groupColors: {
          ...current.groupColors,
          ...(current.groupColors?.[oldName]
            ? { [name]: current.groupColors[oldName] }
            : {}),
        },
        cards: current.cards.map((card) =>
          card.group === oldName ? { ...card, group: name } : card,
        ),
      }));
    }
    setEditingGroup(null);
  };

  const deleteEmptyGroup = (group: string) => {
    if (data.cards.some((card) => card.group === group)) return;
    setData((current) => ({
      ...current,
      groupOrder: current.groupOrder.filter((item) => item !== group),
    }));
  };

  const restoreDefaults = () => {
    setData((current) => ({
      cards: [
        ...DEFAULT_CARDS,
        ...current.cards.filter((card) => !card.isDefault),
      ],
      removedDefaultIds: [],
      groupOrder: Array.from(
        new Set([
          ...DEFAULT_GROUPS,
          ...current.groupOrder.filter(
            (group) => !DEFAULT_GROUPS.includes(group),
          ),
        ]),
      ),
    }));
  };

  const defaultsNeedRestore = DEFAULT_CARDS.some((defaultCard) => {
    const current = data.cards.find((card) => card.id === defaultCard.id);
    return (
      !current ||
      ["title", "group", "value", "detail"].some(
        (key) =>
          current[key as keyof CheatsheetCard] !==
          defaultCard[key as keyof CheatsheetCard],
      )
    );
  });

  const handleGroupDrop = (event: React.DragEvent, targetGroup: string) => {
    event.preventDefault();
    if (draggedGroup && draggedGroup !== targetGroup) {
      setData((current) => {
        const order = Array.from(
          new Set([
            ...current.groupOrder,
            ...current.cards.map((card) => card.group),
          ]),
        );
        const from = order.indexOf(draggedGroup);
        const to = order.indexOf(targetGroup);
        if (from < 0 || to < 0) return current;
        order.splice(from, 1);
        order.splice(to, 0, draggedGroup);
        return { ...current, groupOrder: order };
      });
    } else if (draggedCardId) {
      moveCardTo(draggedCardId, targetGroup);
    }
    setDraggedCardId(null);
    setDraggedGroup(null);
  };

  return (
    <main className="cheatsheet-page">
      <header className="cheatsheet-header">
        <div className="cheatsheet-heading">
          <div className="cheatsheet-mark" aria-hidden="true">
            <NotebookPen />
          </div>
          <div>
            <p className="cheatsheet-kicker">KITCHEN REFERENCE</p>
            <h1>Cheatsheet</h1>
          </div>
        </div>
        <div className="cheatsheet-actions">
          {defaultsNeedRestore && (
            <button
              className="cheatsheet-quiet-btn"
              type="button"
              onClick={restoreDefaults}
              title="Restore default cards"
            >
              <RotateCcw aria-hidden="true" />
              <span>Restore defaults</span>
            </button>
          )}
          <button
            className="cheatsheet-secondary-btn"
            type="button"
            onClick={() => {
              setShowGroupForm((open) => !open);
              setShowCardForm(false);
            }}
          >
            <Plus aria-hidden="true" />
            <span>Group</span>
          </button>
          <button
            className="cheatsheet-add-btn"
            type="button"
            onClick={() => {
              setShowCardForm((open) => !open);
              setShowGroupForm(false);
            }}
          >
            <Plus aria-hidden="true" />
            <span>Card</span>
          </button>
        </div>
      </header>

      {showGroupForm && (
        <form className="cheatsheet-inline-form group-form" onSubmit={addGroup}>
          <label htmlFor="new-group-name">New group</label>
          <input
            id="new-group-name"
            autoFocus
            value={groupDraft}
            onChange={(event) => setGroupDraft(event.target.value)}
            placeholder="e.g. Seafood"
            maxLength={40}
          />
          <button
            className="cheatsheet-add-btn"
            type="submit"
            disabled={!groupDraft.trim()}
          >
            <Check aria-hidden="true" />
            <span>Create group</span>
          </button>
          <button
            className="cheatsheet-icon-btn"
            type="button"
            onClick={() => setShowGroupForm(false)}
            aria-label="Cancel"
          >
            <X />
          </button>
        </form>
      )}

      {showCardForm && (
        <form className="cheatsheet-inline-form card-form" onSubmit={addCard}>
          <div className="card-form-heading">
            <strong>Add to your cheatsheet</strong>
            <button
              className="cheatsheet-icon-btn"
              type="button"
              onClick={() => setShowCardForm(false)}
              aria-label="Close form"
            >
              <X />
            </button>
          </div>
          <div className="card-form-kind" role="group" aria-label="Card type">
            <button
              type="button"
              aria-pressed={draft.kind === "temperature"}
              className={draft.kind === "temperature" ? "is-selected" : ""}
              onClick={() => setDraft({ ...draft, kind: "temperature" })}
            >
              <Thermometer /> Temperature
            </button>
            <button
              type="button"
              aria-pressed={draft.kind === "note"}
              className={draft.kind === "note" ? "is-selected" : ""}
              onClick={() => setDraft({ ...draft, kind: "note" })}
            >
              <StickyNote /> Note
            </button>
          </div>
          <label>
            Title
            <input
              autoFocus
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              placeholder={
                draft.kind === "note"
                  ? "e.g. Brine ratio"
                  : "e.g. Salmon medium"
              }
              maxLength={60}
              required
            />
          </label>
          <label>
            Group
            <input
              list="cheatsheet-groups"
              value={draft.group}
              onChange={(event) =>
                setDraft({ ...draft, group: event.target.value })
              }
              placeholder="Choose or create a group"
              maxLength={40}
            />
            <datalist id="cheatsheet-groups">
              {groups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </label>
          {draft.kind === "temperature" && (
            <label>
              Temperature
              <input
                value={draft.value}
                onChange={(event) =>
                  setDraft({ ...draft, value: event.target.value })
                }
                placeholder="145°F / 63°C"
                maxLength={60}
              />
            </label>
          )}
          <label className="card-form-detail">
            {draft.kind === "note" ? "Note" : "Extra detail"}
            <textarea
              value={draft.detail}
              onChange={(event) =>
                setDraft({ ...draft, detail: event.target.value })
              }
              placeholder={
                draft.kind === "note"
                  ? "Your kitchen note..."
                  : "Rest time, technique, or source..."
              }
              rows={2}
              maxLength={240}
            />
          </label>
          <div className="card-form-footer">
            <span>Cards save automatically</span>
            <button
              className="cheatsheet-add-btn"
              type="submit"
              disabled={!draft.title.trim()}
            >
              <Plus aria-hidden="true" />
              <span>Add card</span>
            </button>
          </div>
        </form>
      )}

      <div className="cheatsheet-organizer" aria-label="Cheatsheet groups">
        {groups.length ? (
          groups.map((group, groupIndex) => {
            const groupCards = data.cards.filter(
              (card) => card.group === group,
            );
            return (
              <section
                className={`cheatsheet-group ${draggedGroup === group ? "is-dragging" : ""}`}
                key={group}
                style={
                  {
                    "--group-accent": getGroupColor(group),
                  } as React.CSSProperties
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleGroupDrop(event, group)}
              >
                <header className="cheatsheet-group-header">
                  <button
                    className="cheatsheet-drag-handle group-drag-handle"
                    type="button"
                    draggable
                    aria-label={`Drag to reorder ${group} group`}
                    title="Drag to reorder group"
                    onDragStart={(event) => {
                      setDraggedGroup(group);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", group);
                    }}
                    onDragEnd={() => setDraggedGroup(null)}
                  >
                    <GripVertical />
                  </button>
                  {editingGroup === group ? (
                    <form
                      className="group-rename-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        renameGroup(group);
                      }}
                    >
                      <input
                        autoFocus
                        value={groupNameDraft}
                        onChange={(event) =>
                          setGroupNameDraft(event.target.value)
                        }
                        onBlur={() => renameGroup(group)}
                        maxLength={40}
                        aria-label="Group name"
                      />
                      <button
                        className="cheatsheet-icon-btn"
                        type="submit"
                        aria-label="Save group name"
                      >
                        <Check />
                      </button>
                    </form>
                  ) : (
                    <h2>{group}</h2>
                  )}
                  <span className="cheatsheet-group-count">
                    {groupCards.length}
                  </span>
                  <div className="cheatsheet-group-tools">
                    <label
                      className="group-color-control"
                      title={`Choose ${group} title color`}
                    >
                      <Palette aria-hidden="true" />
                      <input
                        type="color"
                        value={getGroupColor(group)}
                        onChange={(event) =>
                          setGroupColor(group, event.target.value)
                        }
                        aria-label={`Choose ${group} title color`}
                      />
                    </label>
                    <button
                      className="cheatsheet-icon-btn"
                      type="button"
                      onClick={() => moveGroup(group, -1)}
                      disabled={groupIndex === 0}
                      title="Move group up"
                      aria-label={`Move ${group} group up`}
                    >
                      <ArrowUp />
                    </button>
                    <button
                      className="cheatsheet-icon-btn"
                      type="button"
                      onClick={() => moveGroup(group, 1)}
                      disabled={groupIndex === groups.length - 1}
                      title="Move group down"
                      aria-label={`Move ${group} group down`}
                    >
                      <ArrowDown />
                    </button>
                    <button
                      className="cheatsheet-icon-btn"
                      type="button"
                      onClick={() => {
                        setEditingGroup(group);
                        setGroupNameDraft(group);
                      }}
                      title="Rename group"
                      aria-label={`Rename ${group} group`}
                    >
                      <Pencil />
                    </button>
                    {groupCards.length === 0 && (
                      <button
                        className="cheatsheet-icon-btn danger-action"
                        type="button"
                        onClick={() => deleteEmptyGroup(group)}
                        title="Delete empty group"
                        aria-label={`Delete ${group} group`}
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                </header>
                {groupCards.length ? (
                  <div className="cheatsheet-card-list">
                    {groupCards.map((card, cardIndex) => (
                      <article
                        className={`cheatsheet-card-row ${draggedCardId === card.id ? "is-dragging" : ""}`}
                        key={card.id}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggedGroup) return;
                          event.stopPropagation();
                          if (draggedCardId)
                            moveCardTo(draggedCardId, group, card.id);
                          setDraggedCardId(null);
                        }}
                      >
                        <button
                          className="cheatsheet-drag-handle card-drag-handle"
                          type="button"
                          draggable
                          aria-label={`Drag ${card.title} to reorder`}
                          title="Drag to reorder or move groups"
                          onDragStart={(event) => {
                            setDraggedCardId(card.id);
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", card.id);
                          }}
                          onDragEnd={() => setDraggedCardId(null)}
                        >
                          <GripVertical />
                        </button>
                        <button
                          className="cheatsheet-card-open"
                          type="button"
                          onClick={() => setSelectedCard(card)}
                          aria-label={`Read details for ${card.title}`}
                        >
                          <div className="cheatsheet-card-copy">
                            <div className="cheatsheet-card-title-line">
                              <span
                                className={`cheatsheet-kind-mark ${card.kind}`}
                                aria-hidden="true"
                              >
                                {card.kind === "note" ? (
                                  <StickyNote />
                                ) : (
                                  <Thermometer />
                                )}
                              </span>
                              <h3>{card.title}</h3>
                              {card.isDefault && (
                                <span className="default-mark">DEFAULT</span>
                              )}
                            </div>
                            {card.detail && <p>{card.detail}</p>}
                          </div>
                        </button>
                        {card.value && (
                          <strong className="cheatsheet-card-value">
                            {card.value}
                          </strong>
                        )}
                        <div className="cheatsheet-card-tools">
                          <button
                            className="cheatsheet-icon-btn"
                            type="button"
                            onClick={() =>
                              setEditingCardId(
                                editingCardId === card.id ? null : card.id,
                              )
                            }
                            title="Edit card"
                            aria-label={`Edit ${card.title}`}
                          >
                            <Pencil />
                          </button>
                          <button
                            className="cheatsheet-icon-btn"
                            type="button"
                            onClick={() =>
                              moveCardWithinGroup(groupCards, cardIndex, -1)
                            }
                            disabled={cardIndex === 0}
                            title="Move card up"
                            aria-label={`Move ${card.title} up`}
                          >
                            <ArrowUp />
                          </button>
                          <button
                            className="cheatsheet-icon-btn"
                            type="button"
                            onClick={() =>
                              moveCardWithinGroup(groupCards, cardIndex, 1)
                            }
                            disabled={cardIndex === groupCards.length - 1}
                            title="Move card down"
                            aria-label={`Move ${card.title} down`}
                          >
                            <ArrowDown />
                          </button>
                          <button
                            className="cheatsheet-icon-btn danger-action"
                            type="button"
                            onClick={() => deleteCard(card.id)}
                            title="Delete card"
                            aria-label={`Delete ${card.title}`}
                          >
                            <Trash2 />
                          </button>
                        </div>
                        {editingCardId === card.id && (
                          <div className="cheatsheet-card-editor">
                            <label>
                              Title
                              <input
                                value={card.title}
                                onChange={(event) =>
                                  updateCard(card.id, {
                                    title: event.target.value,
                                  })
                                }
                              />
                            </label>
                            {card.kind === "temperature" && (
                              <label>
                                Temperature
                                <input
                                  value={card.value}
                                  onChange={(event) =>
                                    updateCard(card.id, {
                                      value: event.target.value,
                                    })
                                  }
                                />
                              </label>
                            )}
                            <label className="editor-detail">
                              {card.kind === "note" ? "Note" : "Detail"}
                              <textarea
                                value={card.detail}
                                onChange={(event) =>
                                  updateCard(card.id, {
                                    detail: event.target.value,
                                  })
                                }
                                rows={2}
                              />
                            </label>
                            <button
                              className="cheatsheet-quiet-btn"
                              type="button"
                              onClick={() => setEditingCardId(null)}
                            >
                              <Check />
                              <span>Done</span>
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="cheatsheet-group-empty">
                    Drop a card here or add a new card to this group.
                  </p>
                )}
              </section>
            );
          })
        ) : (
          <div className="cheatsheet-empty">
            <NotebookPen />
            <p>
              Your cheatsheet is clear. Add a group or restore the defaults.
            </p>
          </div>
        )}
      </div>

      <footer className="cheatsheet-footnote">
        <span className="safety-dot" aria-hidden="true" />
        Steak doneness ranges are approximate pull temperatures; carryover
        cooking raises the final temperature. Follow the food-safety minimums in
        the Food safety group.
      </footer>

      {selectedCard && (
        <div
          className="cheatsheet-detail-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCard(null);
          }}
        >
          <section
            className="cheatsheet-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cheatsheet-detail-title"
            aria-describedby="cheatsheet-detail-copy"
          >
            <header className="cheatsheet-detail-header">
              <span
                className={`cheatsheet-detail-mark ${selectedCard.kind}`}
                aria-hidden="true"
              >
                {selectedCard.kind === "note" ? (
                  <StickyNote />
                ) : (
                  <Thermometer />
                )}
              </span>
              <span className="cheatsheet-detail-group">
                {selectedCard.group}
              </span>
              <button
                className="cheatsheet-icon-btn"
                type="button"
                onClick={() => setSelectedCard(null)}
                aria-label="Close card details"
                autoFocus
              >
                <X />
              </button>
            </header>
            <div className="cheatsheet-detail-body">
              <h2 id="cheatsheet-detail-title">{selectedCard.title}</h2>
              {selectedCard.value && (
                <p className="cheatsheet-detail-value">{selectedCard.value}</p>
              )}
              <div className="cheatsheet-detail-rule" />
              <p id="cheatsheet-detail-copy" className="cheatsheet-detail-copy">
                {selectedCard.detail || "No extra details on this card yet."}
              </p>
              {selectedCard.isDefault && (
                <p className="cheatsheet-detail-source">
                  Kitchen reference · Default card
                </p>
              )}
            </div>
            <footer className="cheatsheet-detail-footer">
              <BookOpen aria-hidden="true" />
              <span>Cheatsheet card</span>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
};
