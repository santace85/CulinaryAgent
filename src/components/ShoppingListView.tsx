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
import "./ShoppingListView.css";

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
      item.id === id ? { ...item, isChecked: !item.isChecked } : item,
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
    if (
      confirm(
        "Are you sure you want to clear your entire grocery shopping list?",
      )
    ) {
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
  const progressPercent =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="shop-container">
      {/* Header & Quick Export Controls */}
      <div className="shop-header-card">
        <div className="shop-header-row">
          <div className="shop-brand">
            <div className="shop-icon-box">
              <ShoppingBag />
            </div>
            <div>
              <h1 className="shop-title">
                Grocery Shopping List
                <span className="shop-sync-badge">LocalStorage Synced 💾</span>
              </h1>
              <p className="shop-subtitle">
                Organized for quick retrieval during grocery store trips
              </p>
            </div>
          </div>

          <div className="shop-actions">
            <button
              onClick={handleCopyText}
              disabled={!totalCount}
              className="shop-action-btn shop-copy-btn"
            >
              {copiedAlert ? (
                <Check className="shop-copy-icon--copied" />
              ) : (
                <Copy />
              )}
              <span>{copiedAlert ? "Copied!" : "Copy List"}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              disabled={!totalCount}
              className="shop-action-btn shop-export-btn"
            >
              <Download />
              <span>Export .TXT</span>
            </button>

            {checkedCount > 0 && (
              <button
                onClick={handleClearChecked}
                className="shop-action-btn shop-clear-checked-btn"
              >
                <Trash2 />
                <span>Clear Checked ({checkedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="shop-progress">
            <div className="shop-progress-label-row">
              <span className="shop-progress-label-left">
                <Store /> Store Trip Progress
              </span>
              <span>
                {checkedCount} of {totalCount} items ({progressPercent}%)
              </span>
            </div>
            <div className="shop-progress-track">
              <div
                className="shop-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form: Add Custom Item */}
      <div className="shop-form-card">
        <h3 className="shop-form-heading">
          <Plus /> Add Custom Grocery Item
        </h3>
        <form onSubmit={handleAddCustomItem} className="shop-form-grid">
          <input
            type="text"
            placeholder="Item name (e.g. Organic Avocados)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="shop-form-input shop-form-input--name"
          />

          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Qty"
            value={newItemAmount || ""}
            onChange={(e) => setNewItemAmount(Number(e.target.value))}
            className="shop-form-input shop-form-input--qty"
          />

          <input
            type="text"
            placeholder="Unit (bag, oz)"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="shop-form-input shop-form-input--unit"
          />

          <select
            value={newItemCategory}
            onChange={(e) =>
              setNewItemCategory(e.target.value as IngredientCategory)
            }
            className="shop-form-select"
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
            className="shop-form-submit-btn"
          >
            <Plus />
          </button>
        </form>
      </div>

      {/* Department Categorized List */}
      {totalCount === 0 ? (
        <div className="shop-empty-state">
          <Package className="shop-empty-icon" />
          <h3 className="shop-empty-title">Your Shopping List is Empty</h3>
          <p className="shop-empty-desc">
            Export ingredients from recipe cards or add custom grocery items
            above!
          </p>
        </div>
      ) : (
        <div className="shop-list">
          {CATEGORIES.map((category) => {
            const catItems = shoppingList.filter(
              (item) => item.category === category,
            );
            if (!catItems.length) return null;

            return (
              <div key={category} className="shop-category-card">
                <div className="shop-category-header">
                  <h3 className="shop-category-heading">
                    📌 {category}{" "}
                    <span className="shop-category-count">
                      ({catItems.length})
                    </span>
                  </h3>
                </div>

                <div className="shop-items-grid">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`shop-item ${
                        item.isChecked
                          ? "shop-item--checked"
                          : "shop-item--unchecked"
                      }`}
                    >
                      <div className="shop-item-left">
                        <button className="shop-item-check-btn">
                          {item.isChecked ? (
                            <CheckCircle2 className="shop-item-check-icon--checked" />
                          ) : (
                            <Circle className="shop-item-check-icon--unchecked" />
                          )}
                        </button>
                        <div>
                          <span className="shop-item-name">{item.name}</span>
                          {item.recipeSource && (
                            <span className="shop-item-source">
                              From: {item.recipeSource}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shop-item-right">
                        <span className="shop-item-amount">
                          {item.amount > 0 ? item.amount : ""} {item.unit}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="shop-item-remove-btn"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="shop-clear-all-row">
            <button onClick={handleClearAll} className="shop-clear-all-btn">
              Clear Entire Grocery List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
