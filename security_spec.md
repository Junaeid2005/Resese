# Savory Bite Security Specification & Test Matrix

## 1. System Invariants & Authorization Boundaries
1. **Cart Isolation**: `/carts/{userId}` documents are strictly restricted to `request.auth.uid == userId`. No user can read, sniff, or mutate another customer's cart.
2. **Order Immutability & Customer Privacy**: `/orders/{orderId}` documents can only be queried or read by their author (`customerId == request.auth.uid`) or by authenticated administrators (`isAdmin()`).
3. **Verified Email Requirement**: Only users with verified email (`request.auth.token.email_verified == true` or Google authenticated) can create orders.
4. **Authoritative Menu & Pricing**: Menu items and their selling prices can only be modified by authorized administrators.
5. **Operating Expense Confidentiality**: `/expenses/{expenseId}` documents are only accessible to administrators. Ordinary customers receive `PERMISSION_DENIED`.
6. **Administrator Bootstrapping & Access**: The primary administrator is anchored to `junaeidshohan@gmail.com` or explicit records in the `/admins/{userId}` collection.

## 2. Tested Attack Vectors & Failure Payloads
- **Spoofing Cart Owner**: Attempting to set `userId` in `/carts/victim-uid` while authenticated as `attacker-uid`. -> **DENIED**
- **Unverified Checkout**: Attempting order creation with `email_verified == false` on password account. -> **DENIED**
- **Customer Tampering with Menu Prices**: Attempting write to `/menuItems/{itemId}` as regular customer. -> **DENIED**
- **Reading Competitor / Other Customers' Orders**: Attempting `list` or `get` on `/orders` without matching `customerId`. -> **DENIED**
- **Reading Financial Expenses**: Non-admin querying `/expenses`. -> **DENIED**
- **Self-Promotion to Admin**: Unprivileged user writing to `/admins/{their_uid}`. -> **DENIED**
