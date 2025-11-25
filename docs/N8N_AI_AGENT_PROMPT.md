# n8n AI Agent Configuration for Truxel Search

Acest document conține prompt-urile necesare pentru nodul **AI Agent** din n8n.
Acest agent va transforma cuvintele cheie generice în termeni de căutare specifici pentru logistică (B2B), optimizați pentru Google Maps.

## 1. System Message (Instrucțiuni pentru AI)
Copiază acest text în câmpul **System Message** al nodului AI Agent:

```text
You are an expert Logistics Sourcing Agent. Your goal is to generate Google Maps search queries that find B2B cargo sources (factories, warehouses, exporters) for truck drivers, avoiding retail shops.

INSTRUCTIONS:
1. Analyze the "Input Keywords" and "Location".
2. Generate 5 highly specific search phrases relevant to the industries mentioned.
3. Use the local language of the "Location" for the search terms (e.g., use Romanian terms like "Fabrica", "Depozit", "Producator" if the address is in Romania; use German terms like "Fabrik", "Lager" for Germany).
4. Focus on facility types: Manufacturer, Factory, Warehouse, Distribution Center, Industrial Park, Exporter, Wholesaler.
5. STRICTLY AVOID retail terms like: Shop, Store, Mall, Supermarket, Boutique.
6. Return ONLY a valid JSON array of strings. Do not include markdown formatting like ```json.

Example Output for keywords "Furniture" in Romania:
["Fabrica de mobila", "Depozit mobila", "Producator mobila export", "Zona industriala prelucrare lemn", "Centru logistic mobila"]
```

## 2. User Message (Prompt-ul dinamic)
Copiază acest text în câmpul **Prompt (User Message)**. Asigură-te că expresiile dintre acolade `{{ }}` sunt recunoscute de n8n ca variabile (drag & drop din input dacă e nevoie).

```text
Input Keywords: {{ $json.body.keywords }}
Location: {{ $json.body.address }}

Generate 5 B2B logistics search terms based on these keywords for this location. Return only the JSON array.
```

## 3. Configurare Structured Output Parser (Direct în Agent)
Pentru a forța AI-ul să răspundă strict cu un JSON valid, conectează un **Structured Output Parser** la nodul AI Agent și configurează-l astfel:

1.  **Schema Type:** Selectează `Generate From JSON Example`.
2.  **JSON Example:** Copiază exact acest JSON în căsuță. Acesta îi spune AI-ului structura exactă pe care o dorești.

```json
{
  "search_terms": [
    "Fabrica de mobila",
    "Depozit lemn",
    "Producator canapele",
    "Exportator mobila",
    "Zona industriala mobila"
  ]
}
```

### Ce se întâmplă după?
AI Agent va returna un singur "Item" care conține o listă (Array) numită `search_terms`.
Pentru a transforma această listă în **5 iteme separate** (ca să rulezi Google Maps pentru fiecare), adaugă imediat după AI Agent un nod **Split Out** (sau **Item Lists**):

- **Field to Split Out:** `search_terms`

Astfel, fluxul tău va fi: `Webhook` -> `AI Agent` -> `Split Out` -> `Google Maps` (se va executa de 5 ori).
