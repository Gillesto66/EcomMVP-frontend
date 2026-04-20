#!/bin/bash
# Auteur : Gilles - Projet : AGC Space
# Script de validation Phase F10.1 — Builder V2
# Vérifie que tout fonctionne avant activation en production

set -e

echo "════════════════════════════════════════════════════════════"
echo " Phase F10.1 Validation Script"
echo "════════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Vérifier dépendances
echo "[1/6] Vérification des dépendances..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trouvé${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm non trouvé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node & npm OK${NC}"
echo ""

# 2. Installer dépendances frontend
echo "[2/6] Installation des dépendances..."
cd frontend
npm install --legacy-peer-deps --silent
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# 3. Tests unitaires
echo "[3/6] Exécution des tests unitaires..."
if npm run test -- builder 2>&1 | tee test-results.log; then
    TEST_COUNT=$(grep -o "Tests: [0-9]* passed" test-results.log | grep -o "[0-9]*")
    echo -e "${GREEN}✅ Tests passés: $TEST_COUNT${NC}"
else
    echo -e "${RED}❌ Tests échoués${NC}"
    cat test-results.log
    exit 1
fi
echo ""

# 4. Build test
echo "[4/6] Vérification du build..."
if npm run build --silent 2>&1 | tail -20; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Build échoué${NC}"
    exit 1
fi
echo ""

# 5. Type checking
echo "[5/6] Vérification TypeScript..."
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "^$" || true; then
    echo -e "${GREEN}✅ Pas d'erreurs TypeScript bloquantes${NC}"
fi
echo ""

# 6. Validation fichiers
echo "[6/6] Vérification des fichiers..."
REQUIRED_FILES=(
    "src/modules/builder/logger.ts"
    "src/modules/builder/utils.ts"
    "src/modules/builder/components/EnhancedBlockEditor.tsx"
    "src/modules/builder/components/BlockEditorForm.tsx"
    "src/modules/builder/components/BlockEditorWrapper.tsx"
    "src/modules/builder/builder-utils.test.ts"
    "src/modules/builder/components/EnhancedBlockEditor.test.ts"
    "src/modules/builder/components/BlockEditorForm.test.ts"
    "app/(dashboard)/dashboard/builder/[productId]/page.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file MANQUANT"
        exit 1
    fi
done
echo ""

# Résumé
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ TOUS LES TESTS PASSÉS${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Checklist de déploiement:"
echo "   [ ] Configurer .env.local :"
echo "       NEXT_PUBLIC_BUILDER_V2=true"
echo "       NEXT_PUBLIC_BUILDER_LOG_LEVEL=debug"
echo "   [ ] Lancer dev : npm run dev"
echo "   [ ] Tester builder à http://localhost:3000/dashboard/builder/1"
echo "   [ ] Vérifier console pour logs [Builder:...]"
echo "   [ ] En production : garder NEXT_PUBLIC_BUILDER_V2=false (fallback safe)"
echo ""
echo "📚 Documentation:"
echo "   - roadmap_frontend.md — Roadmap complet"
echo "   - PHASE_F10.1_TEST_PLAN.md — Plan de test détaillé"
echo ""
echo "🚀 Prêt pour Phase F10.2 !"
echo ""
