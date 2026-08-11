#!/bin/bash
set -e

echo "========================================="
echo "  Najenga Test Suite Runner"
echo "========================================="
echo ""

FAILED=0

echo "[1/4] Running PHP Lint..."
if php -l app/Models/*.php && php -l app/Http/Controllers/*.php && php -l app/Http/Controllers/Api/*.php && php -l app/Policies/*.php; then
    echo "  ✓ PHP lint passed"
else
    echo "  ✗ PHP lint failed"
    FAILED=1
fi

echo ""
echo "[2/4] Running Backend Tests..."
if php artisan test; then
    echo "  ✓ All backend tests passed"
else
    echo "  ✗ Some backend tests failed"
    FAILED=1
fi

echo ""
echo "[3/4] Running Frontend Tests..."
if npx vitest run; then
    echo "  ✓ All frontend tests passed"
else
    echo "  ✗ Some frontend tests failed"
    FAILED=1
fi

echo ""
echo "[4/4] Building Frontend..."
if npm run build; then
    echo "  ✓ Build succeeded"
else
    echo "  ✗ Build failed"
    FAILED=1
fi

echo ""
echo "========================================="
if [ $FAILED -eq 0 ]; then
    echo "  ALL CHECKS PASSED"
else
    echo "  SOME CHECKS FAILED"
fi
echo "========================================="

exit $FAILED
