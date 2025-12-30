/repo-root
│
├── /template-src/                 # unmodified third-party template (verbatim)
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── README.md                  # template license/source notes
│
├── /src/                          # canonical source
│   ├── index.html
│   ├── /pages/                    # optional multi-page views
│   │   └── character.html
│   │
│   ├── /css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   └── components.css
│   │
│   ├── /js/
│   │   ├── app.js
│   │   ├── catalog.js
│   │   ├── character.js
│   │   ├── download.js
│   │   └── utils.js
│   │
│   ├── /data/
│   │   ├── index.json
│   │   └── /characters/
│   │       └── example.json
│   │
│   └── /assets/
│       ├── /img/
│       ├── /icons/
│       └── /fonts/
│
├── /public/                       # deployed output (mirrors /src or build output)
│   └── (generated or copied files)
│
├── /automation/                   # codex + automation schemas (tracked)
│   ├── /codex/                    
│   │   ├── AGENTS.md
│   │   ├── DIRECTIVES.md
│   │   └── /tasks/                # optional per-task directives
│   │       └── 000-bootstrap-ui.md
│   │
│   ├── /schemas/                  # jsonschema/yaml schemas for data + outputs
│   │   ├── character.schema.json
│   │   ├── index.schema.json
│   │   └── output-manifest.schema.json
│   │
│   ├── /pipelines/                # automation flow docs (human-readable)
│   │   ├── build.md
│   │   ├── release.md
│   │   └── provenance.md
│   │
│   └── /samples/                  # example payloads for agents/tools
│       ├── character.example.json
│       └── index.example.json
│
├── /scripts/                      # helper scripts (optional)
│   ├── sync-neocities.sh
│   ├── validate-data.py
│   └── build.sh
│
├── .gitignore
├── README.md
└── LICENSE