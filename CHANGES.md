# What changed & how to apply this

This zip contains **only the files that were added or changed** (no `node_modules`,
no `package-lock.json`, no uploaded images) — extract it directly into your existing
`houserent-mern-app` project folder and let it overwrite the matching files. Your
`.env`, `node_modules`, and uploaded images are untouched.

No new npm packages were added, so you do **not** need to run `npm install` again -
your existing `node_modules` folders still work.

## 1. Same email, two accounts (Renter/Buyer + Owner)

- `server/src/models/User.js`: email is no longer globally unique — instead there's
  a unique index on **email + role**. So `me@example.com` can have one Renter/Buyer
  account and one separate Owner account, each with its own password.
- `server/src/routes/userRoutes.js`:
  - **Register** now checks for a conflict only on the *same* email+role combo.
  - **Login** takes just email + password. Since an email might match two accounts,
    it checks the password against each matching account and logs you into
    whichever one it matches — no "login as" picker needed.
  - **Forgot password** now needs you to pick which account (Renter/Buyer or Owner)
    you're resetting, since email alone can't tell them apart anymore.

## 2. In-app chat (after a booking is sent)

- New `server/src/models/Message.js` and `server/src/routes/chatRoutes.js`:
  a simple chat thread tied to each booking. Only the renter/buyer who sent that
  booking and the property's owner can read/post in it. Chat is open as soon as
  the booking is sent, regardless of pending/approved/rejected status.
- New `client/src/modules/chat/ChatRoom.jsx`: the chat page (`/chat/:bookingId`),
  refreshing every ~4 seconds to pick up new messages (no extra dependencies).
- "Chat" buttons were added to the renter's **My Bookings** page and the owner's
  **Booking Requests** page.

## 3. Owner can edit price/rent (and everything else)

- New `client/src/modules/user/owner/EditProperty.jsx` — an edit form for the
  owner's own listings, with price/rent front and center. Reuses the existing
  `PUT /api/owner/properties/:id` endpoint (already supported price updates).
- Added a small `GET /api/owner/properties/:id` route to prefill the edit form.
- "Edit" button added next to "Delete" on the owner's **My Properties** page.

## 4. Property documents

Checked — there was never a document-upload step when adding a property (only
photos), so nothing needed to change there.

## 5. Theme: clean, light & minimal (blue accent, India-focused)

- `client/src/index.css` rewritten again: lighter/flatter surfaces (subtle blur, not
  heavy glass), blue accent color, tighter shadows, Inter font.
- `client/index.html`: added the Inter font, updated page title to "HouseRent India".
- `client/src/components/Navbar.jsx`: brand renamed to "HouseRent India".
- New `client/src/utils/formatCurrency.js`: Indian-style price formatting -
  full amounts show Indian digit grouping (e.g. `₹12,34,567`), and property
  cards/chat show a compact Lakh/Crore form (e.g. `₹1.25 Cr`, `₹85 L`). Used on
  property cards, property details, the chat header, and the Add/Edit Property
  price fields (which show a live "That's ₹X L" hint as you type).

## 6. Improved property search

- `client/src/modules/user/renter/AllProperties.jsx` was rebuilt: live
  (debounced) search-as-you-type, city filter, min/max price, minimum bedrooms,
  sort by newest/price, a "results found" count, and a clear-filters button.
- `server/src/routes/userRoutes.js`: the `GET /api/user/properties` endpoint now
  supports `minPrice`, `maxPrice`, `bedrooms`, and `sort` query params, and searches
  across title/city/state/description instead of just the title.

## Important: existing data note

Because of the new **email + role** unique index, if you already have real user
accounts in your database, MongoDB needs to rebuild that index. This happens
automatically the next time the server starts and Mongoose syncs indexes — no
manual migration needed, since your existing accounts already have unique
email+role combinations (nobody had two accounts on the same email before).

## 7. Removed move-in / move-out dates from booking

Renters/buyers no longer enter a move-in or move-out date when sending a
booking request — it's just a message now. Removed from:
- `server/src/models/Booking.js` (fields dropped)
- `server/src/routes/userRoutes.js` (booking creation no longer requires/stores dates)
- `client/src/modules/user/PropertyDetails.jsx` (booking form)
- `client/src/modules/user/renter/RenterHome.jsx` (booking list now shows the
  request type and the date it was sent, instead of a date range)

If you have existing bookings in your database with `startDate`/`endDate`, those
fields are simply ignored going forward — no migration needed.

## 8. Remove a listing - but only with the owner's consent

Admins can no longer unilaterally delete a listing. Instead:
- **Admin** (`/admin/properties`): a new **"Request Removal"** button lets an
  admin flag a listing with a reason (e.g. a policy violation). The listing
  **stays live** until the owner responds.
- **Owner** (`/owner/properties`): if a removal request is pending, the owner
  sees a banner with the admin's reason and two buttons - **"Consent & Remove"**
  or **"Decline"**. Only consenting actually takes the listing down (sets its
  status to `removed`, which hides it from search and its own detail page).
- New backend: `Property.removalRequest` (status/reason/who asked/when),
  `POST /api/admin/properties/:id/request-removal`, and
  `POST /api/owner/properties/:id/removal-response`.

## 9. UI overhaul to match the PropMatch reference (screenshots)

Rebuilt the theme to match the dark navy navbar / indigo accent / pill-badge
look you shared, and pulled in a couple of genuinely good ideas from it:

- **Navbar**: dark navy bar, logo with a building icon, pill-style nav tabs
  (per role - e.g. Owners see "My Properties" / "Booking Requests"), a user
  avatar circle + name + role, and an icon-only logout button.
  (`client/src/components/Navbar.jsx`, new `client/src/components/Icons.jsx`
  for small dependency-free inline SVG icons.)
- **Hero banner**: new reusable dark banner component
  (`client/src/components/HeroBanner.jsx`) used on the owner's "My Properties"
  page, matching the "Landlord Command Hub" style header with an eyebrow
  label, big heading, subtext, and a call-to-action button.
- **Page header card**: new reusable white header component
  (`client/src/components/PageHeaderCard.jsx`) with a "Refresh" action, used
  on "My Bookings" (renter) and "Booking Requests" (owner) pages - matching
  the "Property Offer & Negotiation Board" style header.
- **Property cards**: redesigned to match - listing-type pill badge (indigo
  "For Rent" / green "For Sale") and a property-type pill overlaid on the
  image, price prominent, address with a pin icon, and a bed/bath/area stats
  row with icons - all matching the reference's card layout.
- **New "Property type" field** (Apartment, Independent House, Villa, Studio,
  Plot, Commercial - common Indian categories) and a new **"Area (sq. ft.)"**
  field, added because the reference app's cards showcase this kind of
  categorization and it's genuinely useful for an India-focused listing site.
  Added to the Property model, the Add/Edit Property forms, property cards,
  and as a new filter on the search page.
- Color palette switched to indigo/purple (`#6d5ef8`) on a light gray page
  background with white cards, replacing the earlier frosted-glass/blue theme.

No new npm packages were needed - all icons are small inline SVGs.
