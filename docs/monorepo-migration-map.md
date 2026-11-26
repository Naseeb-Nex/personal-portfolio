# Monorepo Migration Map

This document captures the repository restructure from the legacy layout to the monorepo clean-architecture standard for cross-branch rebasing (such as `companion-pixel`).

## Overview
- **Frontend**: Restructured from `frontend/` into `apps/web/` following Feature-Sliced Design (FSD v2.1) with layers `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- **Backend**: Restructured from `backend/` into `apps/api/` following Clean Architecture concentric layers (`domain`, `application`, `infrastructure`, `presentation`).
- **Root / Infra**: Shared root directories created: `packages/`, `infra/`, `docs/`, and `scripts/`.

## Directory Structure Tree

### Legacy Structure
```
personal-portfolio/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── domain/
│   │   └── infra/
│   └── tests/
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── features/
        ├── pages/
        ├── shared/
        └── styles/
```

### New Monorepo Structure
```
personal-portfolio/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   └── tests/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   ├── pages/
│       │   ├── widgets/
│       │   ├── features/
│       │   ├── entities/
│       │   └── shared/
│       └── tests/
├── packages/
├── infra/
├── docs/
├── scripts/
└── .pi/skills/monorepo-clean-architecture/
```

## Old Path -> New Path Mapping

| Original Path | New Monorepo Path |
| :--- | :--- |
| `backend/app/__init__.py` | `apps/api/app/__init__.py` |
| `backend/app/api/__init__.py` | `apps/api/app/presentation/__init__.py` |
| `backend/app/api/deps.py` | `apps/api/app/presentation/deps.py` |
| `backend/app/api/endpoints/__init__.py` | `apps/api/app/presentation/endpoints/__init__.py` |
| `backend/app/api/endpoints/chat.py` | `apps/api/app/presentation/endpoints/chat.py` |
| `backend/app/api/endpoints/health.py` | `apps/api/app/presentation/endpoints/health.py` |
| `backend/app/api/endpoints/session.py` | `apps/api/app/presentation/endpoints/session.py` |
| `backend/app/api/router.py` | `apps/api/app/presentation/router.py` |
| `backend/app/config.py` | `apps/api/app/config.py` |
| `backend/app/dependencies.py` | `apps/api/app/dependencies.py` |
| `backend/app/domain/modules/agent/entity.py` | `apps/api/app/domain/modules/agent/entity.py` |
| `backend/app/domain/modules/agent/repository.py` | `apps/api/app/domain/modules/agent/repository.py` |
| `backend/app/domain/modules/session/entity.py` | `apps/api/app/domain/modules/session/entity.py` |
| `backend/app/domain/modules/session/repository.py` | `apps/api/app/domain/modules/session/repository.py` |
| `backend/app/infra/adapters/llm.py` | `apps/api/app/infrastructure/adapters/llm.py` |
| `backend/app/infra/adapters/vector_store.py` | `apps/api/app/infrastructure/adapters/vector_store.py` |
| `backend/app/infra/database/database.py` | `apps/api/app/infrastructure/database/database.py` |
| `backend/app/infra/database/schema.json` | `apps/api/app/infrastructure/database/schema.json` |
| `backend/app/infra/repositories/session.py` | `apps/api/app/infrastructure/repositories/session.py` |
| `backend/app/infra/services/agent.py` | `apps/api/app/infrastructure/services/agent.py` |
| `backend/app/main.py` | `apps/api/app/main.py` |
| `backend/docs/portfolio_agent_backend_plan.md` | `apps/api/docs/portfolio_agent_backend_plan.md` |
| `backend/gemini.md` | `apps/api/gemini.md` |
| `backend/requirements.txt` | `apps/api/requirements.txt` |
| `backend/setup/init_db.py` | `apps/api/setup/init_db.py` |
| `backend/test_agent.py` | `apps/api/test_agent.py` |
| `backend/test_direct.py` | `apps/api/test_direct.py` |
| `backend/tests/__init__.py` | `apps/api/tests/__init__.py` |
| `backend/tests/test_agent.py` | `apps/api/tests/test_agent.py` |
| `backend/tests/test_chat.py` | `apps/api/tests/test_chat.py` |
| `backend/tests/test_health.py` | `apps/api/tests/test_health.py` |
| `backend/tests/test_session.py` | `apps/api/tests/test_session.py` |
| `frontend/.env` | `apps/web/.env` |
| `frontend/.gitignore` | `apps/web/.gitignore` |
| `frontend/README.md` | `apps/web/README.md` |
| `frontend/eslint.config.js` | `apps/web/eslint.config.js` |
| `frontend/gemini.md` | `apps/web/gemini.md` |
| `frontend/index.html` | `apps/web/index.html` |
| `frontend/package-lock.json` | `apps/web/package-lock.json` |
| `frontend/package.json` | `apps/web/package.json` |
| `frontend/playwright.config.ts` | `apps/web/playwright.config.ts` |
| `frontend/public/favicon.svg` | `apps/web/public/favicon.svg` |
| `frontend/public/icons.svg` | `apps/web/public/icons.svg` |
| `frontend/public/robots.txt` | `apps/web/public/robots.txt` |
| `frontend/public/sitemap.xml` | `apps/web/public/sitemap.xml` |
| `frontend/src/App.tsx` | `apps/web/src/app/App.tsx` |
| `frontend/src/assets/fonts/StackSansNotch-Bold.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-Bold.ttf` |
| `frontend/src/assets/fonts/StackSansNotch-ExtraLight.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-ExtraLight.ttf` |
| `frontend/src/assets/fonts/StackSansNotch-Light.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-Light.ttf` |
| `frontend/src/assets/fonts/StackSansNotch-Medium.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-Medium.ttf` |
| `frontend/src/assets/fonts/StackSansNotch-Regular.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-Regular.ttf` |
| `frontend/src/assets/fonts/StackSansNotch-SemiBold.ttf` | `apps/web/src/shared/assets/fonts/StackSansNotch-SemiBold.ttf` |
| `frontend/src/assets/icons/anthropic_white.svg` | `apps/web/src/shared/assets/icons/anthropic_white.svg` |
| `frontend/src/assets/icons/chatbot.svg` | `apps/web/src/shared/assets/icons/chatbot.svg` |
| `frontend/src/assets/icons/claude-ai-icon.svg` | `apps/web/src/shared/assets/icons/claude-ai-icon.svg` |
| `frontend/src/assets/icons/claude-code-color.svg` | `apps/web/src/shared/assets/icons/claude-code-color.svg` |
| `frontend/src/assets/icons/copilot_dark.svg` | `apps/web/src/shared/assets/icons/copilot_dark.svg` |
| `frontend/src/assets/icons/docker.svg` | `apps/web/src/shared/assets/icons/docker.svg` |
| `frontend/src/assets/icons/fastapi.svg` | `apps/web/src/shared/assets/icons/fastapi.svg` |
| `frontend/src/assets/icons/gemini.svg` | `apps/web/src/shared/assets/icons/gemini.svg` |
| `frontend/src/assets/icons/github_dark.svg` | `apps/web/src/shared/assets/icons/github_dark.svg` |
| `frontend/src/assets/icons/hugging_face.svg` | `apps/web/src/shared/assets/icons/hugging_face.svg` |
| `frontend/src/assets/icons/langchain-logo.svg` | `apps/web/src/shared/assets/icons/langchain-logo.svg` |
| `frontend/src/assets/icons/langgraph.svg` | `apps/web/src/shared/assets/icons/langgraph.svg` |
| `frontend/src/assets/icons/python.svg` | `apps/web/src/shared/assets/icons/python.svg` |
| `frontend/src/assets/images/about.png` | `apps/web/src/shared/assets/images/about.png` |
| `frontend/src/assets/images/hero.png` | `apps/web/src/shared/assets/images/hero.png` |
| `frontend/src/assets/models/xylophone-09.glb` | `apps/web/src/shared/assets/models/xylophone-09.glb` |
| `frontend/src/assets/vite.svg` | `apps/web/src/shared/assets/vite.svg` |
| `frontend/src/features/about/infrastructure/components/AboutMe/AboutMe.css` | `apps/web/src/widgets/about/ui/AboutMe.css` |
| `frontend/src/features/about/infrastructure/components/AboutMe/AboutMe.tsx` | `apps/web/src/widgets/about/ui/AboutMe.tsx` |
| `frontend/src/features/career/infrastructure/components/Career.css` | `apps/web/src/widgets/career/ui/Career.css` |
| `frontend/src/features/career/infrastructure/components/Career.tsx` | `apps/web/src/widgets/career/ui/Career.tsx` |
| `frontend/src/features/chat/domain/chat.model.ts` | `apps/web/src/features/chat/model/chat.model.ts` |
| `frontend/src/features/chat/domain/chat.repository.ts` | `apps/web/src/features/chat/model/chat.repository.ts` |
| `frontend/src/features/chat/infrastructure/api/chat.api-repository.ts` | `apps/web/src/features/chat/api/chat.api-repository.ts` |
| `frontend/src/features/chat/infrastructure/components/Cards/Cards.css` | `apps/web/src/features/chat/ui/Cards.css` |
| `frontend/src/features/chat/infrastructure/components/Cards/Cards.tsx` | `apps/web/src/features/chat/ui/Cards.tsx` |
| `frontend/src/features/chat/infrastructure/components/ChatWidget/ChatWidget.css` | `apps/web/src/features/chat/ui/ChatWidget.css` |
| `frontend/src/features/chat/infrastructure/components/ChatWidget/ChatWidget.tsx` | `apps/web/src/features/chat/ui/ChatWidget.tsx` |
| `frontend/src/features/chat/infrastructure/hooks/useChat.ts` | `apps/web/src/features/chat/model/useChat.ts` |
| `frontend/src/features/contact/infrastructure/components/Contact.css` | `apps/web/src/widgets/contact/ui/Contact.css` |
| `frontend/src/features/contact/infrastructure/components/Contact.tsx` | `apps/web/src/widgets/contact/ui/Contact.tsx` |
| `frontend/src/features/hero/components/Hero.css` | `apps/web/src/widgets/hero/ui/Hero.css` |
| `frontend/src/features/hero/components/Hero.tsx` | `apps/web/src/widgets/hero/ui/Hero.tsx` |
| `frontend/src/features/hero/components/ThemeToggle.tsx` | `apps/web/src/features/theme-toggle/ui/ThemeToggle.tsx` |
| `frontend/src/features/hero/infrastructure/components/HeroContent/HeroContent.css` | `apps/web/src/widgets/hero/ui/HeroContent.css` |
| `frontend/src/features/hero/infrastructure/components/HeroContent/HeroContent.tsx` | `apps/web/src/widgets/hero/ui/HeroContent.tsx` |
| `frontend/src/features/hero/lib/FBO.ts` | `apps/web/src/widgets/hero/lib/FBO.ts` |
| `frontend/src/features/hero/lib/FBOHelper.ts` | `apps/web/src/widgets/hero/lib/FBOHelper.ts` |
| `frontend/src/features/hero/lib/FluidSim.ts` | `apps/web/src/widgets/hero/lib/FluidSim.ts` |
| `frontend/src/features/hero/lib/XylophoneScene.ts` | `apps/web/src/widgets/hero/lib/XylophoneScene.ts` |
| `frontend/src/features/hero/lib/helix.ts` | `apps/web/src/widgets/hero/lib/helix.ts` |
| `frontend/src/features/hero/lib/picking.ts` | `apps/web/src/widgets/hero/lib/picking.ts` |
| `frontend/src/features/hero/shaders/fluid/fluidAdvectionFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidAdvectionFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidBaseVert.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidBaseVert.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidClearFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidClearFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidCurlFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidCurlFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidDivergenceFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidDivergenceFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidGradientSubtractFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidGradientSubtractFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidPressureFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidPressureFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidSplatFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidSplatFrag.glsl` |
| `frontend/src/features/hero/shaders/fluid/fluidVorticityFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/fluid/fluidVorticityFrag.glsl` |
| `frontend/src/features/hero/shaders/postprocessing/blitFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/postprocessing/blitFrag.glsl` |
| `frontend/src/features/hero/shaders/postprocessing/blitVert.glsl` | `apps/web/src/widgets/hero/lib/shaders/postprocessing/blitVert.glsl` |
| `frontend/src/features/hero/shaders/xylophone/glassNormalFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/xylophone/glassNormalFrag.glsl` |
| `frontend/src/features/hero/shaders/xylophone/xylophoneFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/xylophone/xylophoneFrag.glsl` |
| `frontend/src/features/hero/shaders/xylophone/xylophoneVert.glsl` | `apps/web/src/widgets/hero/lib/shaders/xylophone/xylophoneVert.glsl` |
| `frontend/src/features/hero/shaders/xylophoneBg/xylophoneBgFrag.glsl` | `apps/web/src/widgets/hero/lib/shaders/xylophoneBg/xylophoneBgFrag.glsl` |
| `frontend/src/features/hero/shaders/xylophoneBg/xylophoneBgVert.glsl` | `apps/web/src/widgets/hero/lib/shaders/xylophoneBg/xylophoneBgVert.glsl` |
| `frontend/src/features/manifesto/infrastructure/components/Manifesto/Manifesto.css` | `apps/web/src/widgets/manifesto/ui/Manifesto.css` |
| `frontend/src/features/manifesto/infrastructure/components/Manifesto/Manifesto.tsx` | `apps/web/src/widgets/manifesto/ui/Manifesto.tsx` |
| `frontend/src/features/navbar/infrastructure/components/Navbar/Navbar.tsx` | `apps/web/src/widgets/navbar/ui/Navbar.tsx` |
| `frontend/src/main.tsx` | `apps/web/src/app/main.tsx` |
| `frontend/src/pages/home/HomePage.tsx` | `apps/web/src/pages/home/ui/HomePage.tsx` |
| `frontend/src/shared/infrastructure/components/CinematicName/CinematicName.css` | `apps/web/src/shared/ui/CinematicName/CinematicName.css` |
| `frontend/src/shared/infrastructure/components/CinematicName/CinematicName.tsx` | `apps/web/src/shared/ui/CinematicName/CinematicName.tsx` |
| `frontend/src/shared/infrastructure/components/CinematicName/index.ts` | `apps/web/src/shared/ui/CinematicName/index.ts` |
| `frontend/src/shared/infrastructure/components/CreativeButton/CreativeButton.css` | `apps/web/src/shared/ui/CreativeButton/CreativeButton.css` |
| `frontend/src/shared/infrastructure/components/CreativeButton/CreativeButton.tsx` | `apps/web/src/shared/ui/CreativeButton/CreativeButton.tsx` |
| `frontend/src/shared/infrastructure/components/LiquidEther/LiquidEther.css` | `apps/web/src/shared/ui/LiquidEther/LiquidEther.css` |
| `frontend/src/shared/infrastructure/components/LiquidEther/LiquidEther.tsx` | `apps/web/src/shared/ui/LiquidEther/LiquidEther.tsx` |
| `frontend/src/shared/infrastructure/components/LiquidEther/index.ts` | `apps/web/src/shared/ui/LiquidEther/index.ts` |
| `frontend/src/shared/infrastructure/components/OrbitalRing/OrbitalRing.css` | `apps/web/src/shared/ui/OrbitalRing/OrbitalRing.css` |
| `frontend/src/shared/infrastructure/components/OrbitalRing/OrbitalRing.tsx` | `apps/web/src/shared/ui/OrbitalRing/OrbitalRing.tsx` |
| `frontend/src/shared/infrastructure/components/OrbitalRing/index.ts` | `apps/web/src/shared/ui/OrbitalRing/index.ts` |
| `frontend/src/shared/infrastructure/components/PixelTransition/PixelTransition.tsx` | `apps/web/src/shared/ui/PixelTransition/PixelTransition.tsx` |
| `frontend/src/shared/infrastructure/components/Preloader/Preloader.css` | `apps/web/src/shared/ui/Preloader/Preloader.css` |
| `frontend/src/shared/infrastructure/components/Preloader/Preloader.tsx` | `apps/web/src/shared/ui/Preloader/Preloader.tsx` |
| `frontend/src/shared/infrastructure/components/Preloader/index.ts` | `apps/web/src/shared/ui/Preloader/index.ts` |
| `frontend/src/shared/infrastructure/components/RoleScroller/RoleScroller.css` | `apps/web/src/shared/ui/RoleScroller/RoleScroller.css` |
| `frontend/src/shared/infrastructure/components/RoleScroller/RoleScroller.tsx` | `apps/web/src/shared/ui/RoleScroller/RoleScroller.tsx` |
| `frontend/src/shared/infrastructure/theme/ThemeProvider.tsx` | `apps/web/src/shared/theme/ThemeProvider.tsx` |
| `frontend/src/shared/infrastructure/theme/index.ts` | `apps/web/src/shared/theme/index.ts` |
| `frontend/src/shared/infrastructure/theme/theme.ts` | `apps/web/src/shared/theme/theme.ts` |
| `frontend/src/styles/App.css` | `apps/web/src/app/styles/App.css` |
| `frontend/src/styles/global.css` | `apps/web/src/app/styles/global.css` |
| `frontend/tests/example.spec.ts` | `apps/web/tests/example.spec.ts` |
| `frontend/tsconfig.app.json` | `apps/web/tsconfig.app.json` |
| `frontend/tsconfig.json` | `apps/web/tsconfig.json` |
| `frontend/tsconfig.node.json` | `apps/web/tsconfig.node.json` |
| `frontend/vite.config.ts` | `apps/web/vite.config.ts` |
