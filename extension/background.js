/**
 * QUICK 4AI - Chrome Extension Background Service Worker
 * Handles extension action clicks to open the Side Panel
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[QUICK 4AI] Extension installed.');
  // Configure side panel behavior to open on action click
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('[QUICK 4AI] setPanelBehavior error:', err);
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch (e) {
      console.error('[QUICK 4AI] Failed to open side panel:', e);
    }
  }
});
