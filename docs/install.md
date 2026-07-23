# Installing atelier skills

## Claude Code (plugin marketplace) — primary

    /plugin marketplace add transformteamsg/atelier
    /plugin install tfx@atelier

Skills appear as `/tfx:<name>`. Update with `/plugin marketplace update atelier`
then `/reload-plugins`.

The design skills need Python 3 + PyYAML for the `checks/` scripts. Run `/tfx:setup`
(or `/tfx:start`) for the per-user tool checklist.

## Claude Desktop (folder import)

Each skill under `plugins/tfx/skills/<group>/<skill>/` is a self-contained folder you
can import. To use the design skills, import the whole `plugins/tfx/` folder so the
`standards/` catalog and `checks/` travel with them.

## Other harnesses (Pi, OSS agents)

The canonical, tool-neutral sources are the `SKILL.md` files under
`plugins/tfx/skills/`. Point your harness at those directories directly; the
`.claude-plugin/*.json` manifests are a Claude-specific adapter and can be ignored.
