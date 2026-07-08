# Kristo Eaglet — Thème Shopify custom

Thème Liquid créé à zéro (Online Store 2.0). Direction visuelle : chaleureux/inspirant — crème, doré, typographie serif élégante (Cormorant Garamond + Jost).

## Structure

- `layout/theme.liquid` — squelette HTML, fontes, variables de couleurs
- `config/` — réglages du thème (couleurs, typo, réseaux sociaux) modifiables dans l'éditeur Shopify
- `sections/` — header, footer, hero, collection vedette, image+texte (storytelling), newsletter, pages produit/collection/panier/recherche/404
- `snippets/` — carte produit, prix (avec gestion des soldes)
- `templates/` — templates JSON (sections réorganisables dans l'éditeur)
- `assets/` — base.css (design system complet), global.js (menu mobile + changement de variante)

## Lancer le thème

1. Crée ta boutique sur shopify.com (essai gratuit, puis 1 $/mois les 3 premiers mois).
2. Installe Shopify CLI : `npm install -g @shopify/cli@latest`
3. Depuis ce dossier :
   ```
   shopify theme dev --store TON-STORE.myshopify.com   # prévisualisation live
   shopify theme push                                   # envoyer sur la boutique
   ```
4. Dans l'admin Shopify → Boutique en ligne → Thèmes → Personnaliser :
   - ajoute ton logo (header), ton image hero, choisis la collection vedette
   - renseigne Instagram/TikTok/YouTube dans Réglages du thème

## Checklist boutique (Kenya)

- **Paiements** : installe Pesapal ou Flutterwave (M-Pesa + cartes) depuis l'App Store Shopify. Paystack marche aussi.
- **Fulfillment** : connecte Printful ou Printify (app gratuite) → tes designs → produits synchronisés automatiquement.
- **Domaine** : achète kristoeaglet.com (~10–15 $/an).
- **Légal** : commence en tant que particulier ; enregistre un business name sur eCitizen + KRA PIN dès que les ventes deviennent régulières.

## Inclus

- Version française (`locales/fr.json`) — active le français dans Réglages → Langues de l'admin Shopify
- Ajax cart — ajout au panier sans rechargement, compteur du header mis à jour en direct, fallback classique si le JS échoue

## À ajouter plus tard

- Templates comptes clients (`customers/*`) si tu actives les comptes
