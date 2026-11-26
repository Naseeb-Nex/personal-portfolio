#!/usr/bin/env python3
"""
Level 3 Deterministic Architectural Boundary & Placement Validator.
Pure Python standard library - zero external dependencies.
Operates non-interactively in sandboxed environments (API, CLI, Cowork).
"""

import sys
import re
from pathlib import Path

def validate_path(file_path: str):
    p = Path(file_path)
    parts = p.parts

    # Backend Clean Architecture checks
    if any(k in parts for k in ["api", "backend", "services"]):
        # Composition Root exemption (e.g. main.ts, container.ts, app.module.ts)
        is_bootstrap = any(p.name.startswith(b) for b in ["main.", "app.module.", "container.", "bootstrap."])
        if is_bootstrap:
            return True, "Composition root allowed to bridge layers for DI wiring."

        if "domain" in parts:
            forbidden = ["controllers", "infra", "infrastructure", "orm", "dtos", "repositories_impl", "adapters", "presentation"]
            if any(f in parts for f in forbidden):
                return False, f"Domain pollution: '{file_path}' places outer circle concerns into pure domain."
        if "application" in parts:
            forbidden = ["controllers", "infra", "infrastructure", "presentation"]
            if any(f in parts for f in forbidden):
                return False, f"Application violation: '{file_path}' places delivery/persistence details into use cases."

    # Shared monorepo packages checks
    if "packages" in parts:
        forbidden = ["controllers", "presentation"]
        if any(f in parts for f in forbidden):
            return False, f"Package violation: '{file_path}' puts delivery concerns inside shared packages."

    # Frontend Feature-Sliced Design checks
    if any(k in parts for k in ["web", "frontend", "client"]):
        valid_layers = ["app", "pages", "widgets", "features", "entities", "shared"]
        matched_layer = None
        for layer in valid_layers:
            if layer in parts:
                matched_layer = layer
                break

        if not matched_layer and any(k in parts for k in ["src", "lib"]):
            return False, f"FSD violation: '{file_path}' does not reside in a standard FSD layer (app, pages, widgets, features, entities, shared)."

    return True, "Path conforms to architectural placement boundaries."

def validate_content_imports(file_path: str):
    p = Path(file_path)
    if not p.is_file():
        return True, "File does not exist yet; path validation succeeded."

    content = p.read_text(encoding="utf-8", errors="ignore")
    lines = content.splitlines()

    parts = p.parts
    is_domain = "domain" in parts
    is_application = "application" in parts
    is_frontend = any(k in parts for k in ["web", "frontend", "client"])

    # Exclude test and mock files from domain purity locks
    is_test = any(p.name.endswith(ext) for ext in [".test.ts", ".spec.ts", ".test.js", ".spec.js", ".test.py", "_test.go"])
    if is_test:
        return True, "Test files exempted from production boundary import rules."

    # Composition root files exempted from DI wiring constraints
    is_bootstrap = any(p.name.startswith(b) for b in ["main.", "app.module.", "container.", "bootstrap."])
    if is_bootstrap:
        return True, "Composition root allowed to import across layers for dependency wiring."

    import_regex = re.compile(r'^\s*(?:import|from)\s+[\'"]?([^\'"\s;]+)')

    for idx, line in enumerate(lines, start=1):
        match = import_regex.search(line)
        if not match:
            continue
        imp = match.group(1)

        # Domain purity: no infrastructure/presentation imports
        if is_domain:
            forbidden_modules = ["infrastructure", "presentation", "express", "typeorm", "prisma", "axios", "fastify"]
            if any(fb in imp.lower() for fb in forbidden_modules):
                return False, f"Line {idx}: Domain entity cannot import external/infrastructure module '{imp}'."

        # Application isolation: no infrastructure/presentation imports
        if is_application:
            forbidden_modules = ["infrastructure", "presentation", "express", "fastify"]
            if any(fb in imp.lower() for fb in forbidden_modules):
                return False, f"Line {idx}: Application layer cannot import presentation or infrastructure module '{imp}'."

        # Frontend FSD: public API check (both alias and relative deep slice imports)
        if is_frontend:
            # 1. Alias import violation: @/layer/slice/segment
            deep_slice = re.search(r'[@~]/(features|entities|widgets|pages)/([^/]+)/(ui|model|api|lib)', imp)
            if deep_slice:
                return False, f"Line {idx}: FSD Public API violation. Cross-slice import '{imp}' must import from root '@/{deep_slice.group(1)}/{deep_slice.group(2)}'."

            # 2. Relative cross-slice violation: ../../features/slice/segment or ../other-slice/segment
            rel_deep = re.search(r'\.\./.*(features|entities|widgets|pages)/([^/]+)/(ui|model|api|lib)', imp)
            if rel_deep:
                return False, f"Line {idx}: FSD Public API violation. Relative cross-slice import '{imp}' must use root slice export."

    return True, "Imports conform to dependency inversion and layer boundary rules."

def print_help():
    print("""Architectural Validator
Usage:
  python validate_placement.py --path <file_path>
  python validate_placement.py --check-imports <file_path>
  python validate_placement.py <file_path> (defaults to --path)
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)

    flag = sys.argv[1]
    target = sys.argv[2] if len(sys.argv) > 2 else sys.argv[1]

    if flag in ["--help", "-h"]:
        print_help()
        sys.exit(0)

    if flag == "--check-imports":
        valid, msg = validate_content_imports(target)
    else:
        valid, msg = validate_path(target)

    if not valid:
        print(f"❌ ARCHITECTURAL VIOLATION: {msg}")
        sys.exit(1)
    else:
        print(f"✅ VALID: {msg}")
        sys.exit(0)
