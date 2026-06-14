import React from "react";

import { REWARD_SHOP_ITEMS, canAfford, formatCost } from "../domain/rewards";

export function RewardShopModal({
  open,
  wallet,
  qualifiedShopItems,
  nextPrizeTier,
  onClose,
  onRedeem,
}) {
  if (!open) return null;

  return (
    <div className="shop-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shop-head">
          <div>
            <h2>Drill Rewards</h2>
            <p>Spend Loot, Gems, and Tokens on sprint boosts.</p>
          </div>
          <button className="shop-close" onClick={onClose}>X</button>
        </div>
        <div className="shop-balance">
          <span>Available rewards</span>
          <div className="shop-wallet">
            <span className="wallet-pill loot">💰 {wallet.loot}</span>
            <span className="wallet-pill gems">💎 {wallet.gems}</span>
            <span className="wallet-pill tokens">🪙 {wallet.tokens}</span>
          </div>
          <em>{qualifiedShopItems.length ? `${qualifiedShopItems.length} option${qualifiedShopItems.length === 1 ? "" : "s"} available now` : "Earn event rewards to unlock shop options"}</em>
        </div>
        <div className="shop-qualified">
          <strong>Available now</strong>
          <span>
            {qualifiedShopItems.length
              ? qualifiedShopItems.map((item) => item.name).join(", ")
              : "Nothing yet. Loot buys lifelines, Gems control the timer, Tokens unlock premium saves."}
          </span>
        </div>
        <div className="claim-note">
          <span>Rewards are auto-claimed as you earn them. Spend them during the sprint when an option becomes available.</span>
          <small>Next ladder prize: {nextPrizeTier?.name} at {nextPrizeTier?.score} score.</small>
        </div>
        <div className="shop-grid">
          {REWARD_SHOP_ITEMS.map((item) => (
            <div key={item.id} className={`shop-item ${canAfford(wallet, item.cost) ? "affordable" : "locked"}`}>
              <div className="shop-item-icon">{item.icon}</div>
              <div className="shop-item-rarity">{item.rarity}</div>
              <div className="shop-item-name">{item.name}</div>
              <div className="shop-item-desc">{item.description}</div>
              <button
                className={`shop-item-btn ${canAfford(wallet, item.cost) ? "available" : "disabled"}`}
                onClick={() => onRedeem(item.id)}
                disabled={!canAfford(wallet, item.cost)}
              >
                {formatCost(item.cost)}
              </button>
            </div>
          ))}
        </div>
        <div className="shop-actions">
          <button className="secondary-btn" onClick={onClose}>Close Shop</button>
        </div>
      </div>
    </div>
  );
}
