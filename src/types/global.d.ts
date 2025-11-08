// Make Window.luvbricks_saveShipTo strongly typed everywhere.
declare global {
  interface Window {
    /**
     * Saves the shipping form (if mounted) and returns true/false for success.
     * Set by ShippingForm; consumers can call it before starting checkout.
     */
    luvbricks_saveShipTo?: () => Promise<boolean>;
  }
}
export {};
