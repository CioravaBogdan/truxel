# ✅ CHECKLIST - Pornește Aplicația în 10 Minute

**Status:** 🔴 NU PORNEȘTE → 🟢 FUNCȚIONEAZĂ

---

## 📋 Checklist Pas-cu-Pas

### ☐ **PAS 1: Găsește Proiectul** (2 min)

```powershell
# Caută în locațiile comune:
cd C:\Users\ciora\Desktop
dir /s truxel

# SAU
cd C:\Users\ciora\Documents
dir /s truxel

# SAU
cd C:\Users\ciora\Downloads
dir /s truxel
```

**✅ Am găsit proiectul la:** `_______________________________________`

---

### ☐ **PAS 2: Navighează în Proiect** (30 sec)

```powershell
# Înlocuiește cu calea ta:
cd C:\Users\ciora\[CALEA_TA]\truxel
```

**✅ Sunt în directorul proiectului**

---

### ☐ **PAS 3: Verifică Locația** (30 sec)

```powershell
dir
```

**Trebuie să văd aceste fișiere:**
- ☐ package.json ← IMPORTANT!
- ☐ app.json
- ☐ folder "app"
- ☐ folder "components"

**✅ Văd toate fișierele de mai sus**

---

### ☐ **PAS 4: Verifică Node.js** (30 sec)

```powershell
node --version
npm --version
```

**Trebuie să văd:**
- ☐ Node.js: v20.15.0 sau mai nou
- ☐ npm: 10.7.0 sau mai nou

**✅ Am Node.js și npm instalate**

**❌ NU am Node.js?**
👉 Descarcă de la: https://nodejs.org/ (versiunea LTS)

---

### ☐ **PAS 5: Instalează Dependencies** (3 min)

```powershell
npm install
```

**⏳ Așteaptă 2-5 minute...**

**⚠️ NORMAL să vezi warnings despre Node.js version!**

**✅ Instalarea s-a terminat fără erori critice**

---

### ☐ **PAS 6: Găsește Credențiale Supabase** (2 min)

1. **Deschide browser:**
   ```
   https://app.supabase.com/
   ```

2. **Selectează proiectul tău**

3. **Mergi la:** Settings → API

4. **Copiază:**
   - ☐ Project URL (ex: `https://abc123.supabase.co`)
   - ☐ anon public key (un string lung care începe cu `eyJ...`)

**✅ Am copiat ambele credențiale**

---

### ☐ **PAS 7: Configurează .env** (1 min)

**A. Deschide fișierul `.env`:**
- În VS Code: File → Open → selectează `.env`
- SAU în Notepad: `notepad .env`

**B. Înlocuiește valorile:**

```env
# ÎNAINTE (template):
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# DUPĂ (cu credențialele tale):
EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**C. Salvează fișierul:** Ctrl + S

**✅ Am salvat .env cu credențialele mele**

---

### ☐ **PAS 8: Pornește Aplicația** (30 sec)

```powershell
npm run dev
```

**⏳ Așteaptă 10-30 secunde...**

---

## 🎉 SUCCESS - Ar trebui să vezi:

```
Metro waiting on exp://192.168.x.x:8081

› Press a │ open Android
› Press i │ open iOS
› Press w │ open web

› Press r │ reload app
```

**✅ Văd QR code și opțiuni!** → **🎉 SUCCES!**

**❌ Nu văd asta?** → Citește [EXACT_STEPS.md](./EXACT_STEPS.md) secțiunea "Probleme comune"

---

## 📱 PAS 9: Rulează pe Device

### Pentru Android Emulator:
```powershell
# În terminalul Expo, apasă:
a
```
**✅ Aplicația se deschide pe emulator**

### Pentru telefon fizic:
1. **Instalează "Expo Go"** din Play Store / App Store
2. **Conectează la același WiFi** ca PC-ul
3. **Scanează QR code-ul** din terminal

**✅ Aplicația rulează pe telefon**

### Pentru Web:
```powershell
# În terminalul Expo, apasă:
w
```
**✅ Browser-ul se deschide cu app-ul**

---

## ❌ Troubleshooting Rapid

### Eroare: "Cannot find module"
```powershell
rm -r node_modules
npm install
npm run dev
```

### Eroare: "Metro bundler error"
```powershell
npx expo start -c
```

### Eroare: "Supabase connection failed"
**Verifică:** Credențialele în .env sunt corecte?

### Eroare: "Port 8081 already in use"
```powershell
# Închide toate terminalele
# Pornește din nou npm run dev
```

---

## 📊 Status Final

După ce urmezi toți pașii:

- ☐ Am găsit proiectul
- ☐ Sunt în directorul corect (văd package.json)
- ☐ Am Node.js instalat
- ☐ Am rulat npm install
- ☐ Am configurat .env cu Supabase
- ☐ Am rulat npm run dev
- ☐ Văd QR code și opțiuni în terminal
- ☐ Aplicația rulează pe device/emulator

**Toate bifate?** → **🎉 FELICITĂRI! Aplicația funcționează!**

---

## 🆘 Dacă NU funcționează după checklist:

1. **Re-citește fiecare pas** - Ai făcut exact ce scrie?
2. **Verifică erorile în terminal** - Ce scrie exact?
3. **Citește ghidul complet:** [EXACT_STEPS.md](./EXACT_STEPS.md)
4. **Verifică ghidul Windows:** [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)
5. **Caută eroarea pe Google** - Pune exact mesajul de eroare

---

## ⏱️ Timp Estimat Total: 10 minute

- PAS 1: Găsește proiectul - 2 min
- PAS 2-3: Navighează și verifică - 1 min
- PAS 4: Verifică Node.js - 30 sec
- PAS 5: npm install - 3 min
- PAS 6-7: Supabase config - 3 min
- PAS 8-9: Pornește și rulează - 30 sec

**Total:** ~10 minute ⏱️

---

## 💡 Pro Tips:

1. **Folosește VS Code** - Terminal integrat e mai ușor
2. **Nu închide terminalul** - Metro bundler trebuie să ruleze
3. **Salvează calea** - Notează unde e proiectul pentru viitor
4. **Bookmark-ează ghidurile** - Pentru acces rapid

---

## 📞 Need Help?

**Documente utile:**
- 🎯 [EXACT_STEPS.md](./EXACT_STEPS.md) - Pași detaliate cu explicații
- 🪟 [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) - Ghid complet Windows
- 📚 [DOCS_INDEX.md](./DOCS_INDEX.md) - Index documentație
- 📊 [SUMMARY.md](./SUMMARY.md) - Ce s-a făcut și de ce

---

**Creat:** 22 Octombrie 2025  
**Pentru:** Truxel Mobile App v1.0.0  
**Timp estimat:** ⏱️ 10 minute  
**Dificultate:** ⭐⭐☆☆☆ (Ușor cu ghidul)

**🚀 Începe cu PAS 1 și bifează pe măsură ce avansezi! Succes! 🚀**
