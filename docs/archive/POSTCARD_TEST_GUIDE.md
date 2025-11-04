# 📱 Community PostCard - Test Guide

## What to Test

### 1. **Visual Appearance**

Navigate to **Community tab** → Check any post card:

#### ✅ Expected Layout:
```
┌──────────────────────────────────────┐
│ 👤  🏢 ABC Transport SRL            │
│     John Doe                         │
│     📍 București → Cluj • 🚛 Trailer │
│                         [Your Post]  │
├──────────────────────────────────────┤
│ 🚛 Driver Available                 │
│ Available for routes heading north   │
│ from București                       │
│                                      │
│ [Today] [12T]                       │
├──────────────────────────────────────┤
│ ⏰ 2h ago • 👁️ 15 • 💬 3          │
│                                      │
│         [WhatsApp] [📞] [📧] [🔖]  │
└──────────────────────────────────────┘
```

#### Check:
- [ ] Company name shows **bold** with 🏢 icon
- [ ] Driver name below company (smaller)
- [ ] Avatar larger (48x48)
- [ ] WhatsApp button is **GREEN**
- [ ] Call button is **BLUE**
- [ ] Email button is **INDIGO/PURPLE**
- [ ] Save button is **GRAY**

---

### 2. **WhatsApp Functionality**

**Tap WhatsApp button** on any post:

#### Expected Behavior:
1. Opens WhatsApp app
2. Shows conversation with phone number
3. Message pre-filled:

**For Driver Available:**
```
Hello! I'm [Your Company]. I saw that you're available in the București area. 
I'd like to discuss a possible collaboration.
```

**For Route Available:**
```
Hello! I'm [Your Company]. I saw your post about the route București → Cluj. 
I'm interested in discussing the details.
```

#### Check:
- [ ] WhatsApp opens successfully
- [ ] Phone number correct
- [ ] Message includes YOUR company name
- [ ] Message includes THEIR city/route
- [ ] Message contextual (driver vs route)

---

### 3. **Call Functionality**

**Tap Call button** (blue phone icon):

#### Expected Behavior:
1. Opens phone dialer
2. Number pre-filled
3. Ready to call

#### Check:
- [ ] Dialer opens
- [ ] Number correct (no extra characters)
- [ ] Can initiate call

---

### 4. **Email Functionality**

**Tap Email button** (purple/indigo mail icon):

#### Expected Behavior:
1. Opens email client (Gmail, Outlook, etc.)
2. **Subject** pre-filled:
   - Driver: "Availability in București"
   - Route: "Route București → Cluj"
3. **Body** pre-filled:
   ```
   Hello,

   I'm [Your Company]. I saw that you're available in the București area.

   I'd like to discuss a possible collaboration.

   Thank you!
   ```

#### Check:
- [ ] Email app opens
- [ ] Subject line correct
- [ ] Body includes YOUR company name
- [ ] Body includes THEIR city/route
- [ ] Professional formatting

---

### 5. **Trial User Protection**

**If you're on TRIAL tier:**

**Tap any contact button** (WhatsApp/Call/Email):

#### Expected Behavior:
Shows upgrade prompt:
```
⚠️ Upgrade Required

You need an active subscription to view contacts.

[Cancel]  [Upgrade]
```

#### Check:
- [ ] Alert shows for trial users
- [ ] Cannot contact without subscription
- [ ] Upgrade button present

---

### 6. **Your Own Posts**

**Find one of YOUR posts** (should have "Your Post" badge):

#### Expected Behavior:
- No contact buttons shown (you can't contact yourself)
- Only stats visible

#### Check:
- [ ] "Your Post" badge visible (gray)
- [ ] NO WhatsApp/Call/Email buttons
- [ ] Stats still show (time, views, contacts)

---

### 7. **Error Handling**

#### Test: WhatsApp Not Installed
1. **Temporarily uninstall WhatsApp** (optional)
2. Tap WhatsApp button
3. Should show: "WhatsApp Not Installed - Install WhatsApp to continue."

#### Test: Missing Phone Number
1. Find post without phone (if any)
2. Tap Call/WhatsApp
3. Should show: "Contact Unavailable - Phone number is not available."

---

## 🐛 Known Issues to Watch For

### Potential Problems:

1. **WhatsApp link malformed** → Number has extra characters
2. **Email client doesn't open** → `mailto:` link blocked
3. **Message not pre-filled** → URL encoding issue
4. **Company name missing** → Profile not loaded
5. **Buttons too small on tablet** → Responsive layout needed

---

## 📸 Screenshots Needed

Please take screenshots of:

1. **Post card full view** (with company name visible)
2. **WhatsApp opened** (with pre-filled message)
3. **Email client** (with subject + body)
4. **Trial upgrade prompt** (if you're on trial)
5. **Your own post** (without contact buttons)

---

## ✅ Success Criteria

### All features working if:
- ✅ Company name shows prominently
- ✅ WhatsApp opens with contextual message
- ✅ Call button initiates phone call
- ✅ Email opens with professional message
- ✅ Trial users blocked (upgrade prompt)
- ✅ All text in English (no hardcoded Romanian)
- ✅ No phone/email exposed in UI

---

## 🚀 Next: Romanian Translation

After testing confirms everything works, we'll add Romanian translations for:

```json
{
  "community": {
    "a_driver": "Un șofer",
    "whatsapp_driver_available": "Bună ziua! Sunt {{myName}}. Am văzut că ești disponibil în zona {{city}}. Aș dori să discutăm o posibilă colaborare.",
    "whatsapp_load_available": "Bună ziua! Sunt {{myName}}. Am văzut postarea ta despre cursa {{origin}} → {{dest}}. Sunt interessat să discutăm detaliile.",
    // ... etc
  }
}
```

---

**Ready to test?** Navigate to Community tab and test one card! 🎯
