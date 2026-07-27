import React, { useState } from "react";
import { ShoppingListItem, IngredientCategory } from "../types";
import {
  exportShoppingListAsText,
  downloadTextFile,
  saveShoppingList,
} from "../utils/storage";
import {
  ShoppingBag,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Download,
  Check,
  Package,
  Store,
} from "lucide-react";

interface ShoppingListViewProps {
  shoppingList: ShoppingListItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
}

const CATEGORIES: IngredientCategory[] = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Pantry & Spices",
  "Bakery",
  "Other",
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  setShoppingList,
}) => {
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemCategory, setNewItemCategory] =
    useState<IngredientCategory>("Produce");

  const toggleCheck = (id: string) => {
    const updated = shoppingList.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setShoppingList(updated);
    saveShoppingList(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = shoppingList.filter((item) => item.id !== id);
    setShoppingList(updated);
    saveShoppingList(updated);
  };

  const handleClearChecked = () => {
    const updated = shoppingList.filter((item) => !item.isChecked);
    setShoppingList(updated);
    saveShoppingList(updated);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire grocery shopping list?")) {
      setShoppingList([]);
      saveShoppingList([]);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: "shop_" + Date.now(),
      name: newItemName.trim(),
      amount: newItemAmount || 1,
      unit: newItemUnit.trim(),
      category: newItemCategory,
      isChecked: false,
      addedAt: new Date().toLocaleDateString(),
    };

    const updated = [newItem, ...shoppingList];
    setShoppingList(updated);
    saveShoppingList(updated);

    setNewItemName("");
    setNewItemAmount(1);
    setNewItemUnit("");
  };

  const handleCopyText = () => {
    const text = exportShoppingListAsText(shoppingList);
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  const handleDownloadFile = () => {
    const text = exportShoppingListAsText(shoppingList);
    downloadTextFile(`Grocery_Shopping_List_${Date.now()}.txt`, text);
  };

  const totalCount = shoppingList.length;
  const checkedCount = shoppingList.filter((i) => i.isChecked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Quick Export Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Grocery Shopping List
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  LocalStorage Synced 💾
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Organized for quick retrieval during grocery store trips
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyText}
              disabled={!totalCount}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            >
              {copiedAlert ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAlert ? "Copied!" : "Copy List"}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              disabled={!totalCount}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export .TXT</span>
            </button>

            {checkedCount > 0 && (
              <button
                onClick={handleClearChecked}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Checked ({checkedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-400" /> Store Trip Progress
              </span>
              <span>
                {checkedCount} of {totalCount} items ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form: Add Custom Item */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-orange-400" /> Add Custom Grocery Item
        </h3>
        <form onSubmit={handleAddCustomItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            placeholder="Item name (e.g. Organic Avocados)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Qty"
            value={newItemAmount || ""}
            onChange={(e) => setNewItemAmount(Number(e.target.value))}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="Unit (bag, oz)"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as IngredientCategory)}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="sm:col-span-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl px-3 py-2 text-xs flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Department Categorized List */}
      {totalCount === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Your Shopping List is Empty</h3>
          <p className="text-xs text-slate-400 mt-1">
            Export ingredients from recipe cards or add custom grocery items above!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const catItems = shoppingList.filter((item) => item.category === category);
            if (!catItems.length) return null;

            return (
              <div key={category} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    📌 {category} <span className="text-slate-500 font-normal">({catItems.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        item.isChecked
                          ? "bg-slate-950/40 border-slate-800 text-slate-500 line-through"
                          : "bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-orange-400">
                          {item.isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <div>
                          <span className="font-medium text-xs sm:text-sm">{item.name}</span>
                          {item.recipeSource && (
                            <span className="block text-[10px] text-slate-500">
                              From: {item.recipeSource}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          {item.amount > 0 ? item.amount : ""} {item.unit}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 underline"
            >
              Clear Entire Grocery List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
