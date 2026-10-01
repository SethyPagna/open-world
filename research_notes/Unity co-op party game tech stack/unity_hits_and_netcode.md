# Unity co-op/party hits and the 2026 multiplayer stack (Unity 6, netcode, licensing, testing)

Research date: 2026-09-28. Scope: tech brief for a small AI-assisted team building a 1-8 player co-op/party/betrayal game in Unity with bots filling seats.

## Q1. Which hit party/co-op games are made in Unity, and what tech did they use?

### Takeaway
The recent "friendslop" hits built in Unity were made by tiny teams on cheap peer-hosted stacks, not dedicated servers. Landfall's circle (Content Warning, PEAK, R.E.P.O.) used Photon PUN. Lethal Company used Netcode for GameObjects (NGO) over a Facepunch Steam transport, and Liar's Bar used Mirror. Only the very large games (Among Us, Fall Guys) used hosted servers. Several games on the list are not Unity at all: Buckshot Roulette (Godot), Only Up! (Unreal 5) and Chained Together (Unreal 5).

### Per-game tech table (only sourced facts; "?" = not found)

| Game | Engine | Netcode / online | Render / visuals | Character & physics | Team / scale |
|---|---|---|---|---|---|
| Lethal Company (2023) | Unity (2022.3.9 per modding SDK) | NGO + "Facepunch Transport for Netcode for GameObjects" + Facepunch.Steamworks (host = a player) | HDRP | ? (kinematic FPS controller likely, unverified) | Solo dev (Zeekerss) |
| PEAK (2025) | Unity | Photon (relay; IP not exposed) | ? | Physics climbing (details unpublished) | 7 people (3 Aggro Crab + 4 Landfall), ~1 month in Seoul; up to 4 players |
| R.E.P.O. (2025) | Unity | Photon PUN + Photon Voice | ? | Heavy rigidbody physics; syncing physics to clients was their main struggle | Semiwork (small Swedish studio); 230k peak CCU |
| Content Warning (2024) | Unity | Photon PUN/Voice (Landfall's Photon app capped rooms at 4) | ? | ? | 5 devs, Feb-Apr 2024; 6.2M free claims in the first 24h |
| Liar's Bar (2024) | Unity | Mirror | ? | ? | Curve Animation (Turkey); 100k+ CCU |
| Among Us (2018) | Unity | Hazel (custom C# RUDP library); servers on Unity Multiplay | 2D | n/a | Small team; 60M peak DAU |
| Fall Guys (2020) | Unity | Hand-modified UNet built with The Multiplayer Group; 60 players on dedicated servers | ? | Comedic physics | Mediatonic |
| Human: Fall Flat (2016) | Unity | Player-hosted lobby, up to 8 online (library not documented) | ? | Active ragdoll with grabbing and climbing | No Brakes Games (Tomas Sakalauskas) |
| Gorilla Tag (2022) | Unity | Not stated in the Unity case study | URP ("significant performance improvements") | Physics-based arm locomotion | Another Axiom; ~90 fps on Quest 2 |
| Goose Goose Duck (2021) | Not confirmed | Not confirmed | 2D | n/a | Gaggle Studios; up to 16 players |
| Buckshot Roulette | **Godot**, not Unity | – | – | – | Solo (Mike Klubnika) |
| Only Up! | **Unreal Engine 5**, not Unity | – | – | – | SCKR Games |
| Chained Together | **Unreal Engine 5**, not Unity | – | – | Physics-simulated chain | Anegar Games; up to 4 players |

### Cited Findings
- **Lethal Company:**
  - Built in Unity by solo developer Zeekerss; early access on 23 Oct 2023 — [Wikipedia](https://en.wikipedia.org/wiki/Lethal_Company); [Wikipedia: Zeekerss](https://en.wikipedia.org/wiki/Zeekerss)
  - Modders use NGO's post-processing ("the 'native' way of networking that the game uses") — [Lethal Company Modding Wiki](https://lethal.wiki/dev/advanced/networking)
  - A mod's csproj references the game's `Facepunch Transport for Netcode for GameObjects`, `Facepunch.Steamworks.Win64`, `Unity.Netcode.Runtime` and `Unity.Netcode.Components` assemblies — [LethalPlayers.csproj](https://github.com/Lightmaxifrvr/LethalPlayers/blob/main/LethalPlayers.csproj)
  - The LethalSDK Unity project recommends Unity 2022.3.9 and ships an HDRP profile — [LethalSDK-Unity-Project](https://github.com/HolographicWings/LethalSDK-Unity-Project)
  - 80.lv has a tutorial on reproducing the game's look in HDRP — [80.lv](https://80.lv/articles/how-to-achieve-lethal-company-s-graphics-with-unity-hdrp)
- **PEAK:**
  - Made by Aggro Crab and Landfall; released 16 June 2025; built in Unity; up to 4 players climb a procedurally generated mountain; sold 100k copies in 24h — [Wikipedia](https://en.wikipedia.org/wiki/Peak_(video_game))
  - Uses Photon server relays, so players' IP addresses are not visible — [Landfall PEAK FAQ](https://landfall.se/peak-faq)
  - Made during a month-long retreat in Seoul by 3 Aggro Crab and 4 Landfall staff. It passed 1M sales a few days after launch — [Game8](https://game8.co/articles/latest/peak-the-viral-climbing-game-resulted-from-a-month-long-game-jam-in-korea)
  - A GDC 2026 talk covered it ("built in one month by seven people") — [cgames.com](https://www.cgames.com/contents/97/10713.html)
  - Game Developer reports "2 million sales for less than $200,000" (headline only; the article returned 403) — [Game Developer](https://www.gamedeveloper.com/production/how-co-op-climbing-hit-peak-achieved-2-million-sales-for-less-than-200-000-)
- **R.E.P.O.:**
  - Built in Unity by Semiwork; early access on 26 Feb 2025; 230k peak concurrent players in the first weekend — [Wikipedia](https://en.wikipedia.org/wiki/R.E.P.O.)
  - Chose Photon PUN on Landfall's recommendation. They could not change SDK "just weeks before the launch".
  - PUN is easy to pick up but provides little for multiplayer physics out of the box. Semiwork: "Making all the physics feel smooth for clients was something we struggled with for a long time".
  - They used Photon Voice. The article cites ~8.7M copies sold in March 2025 (Alinea Analytics).
  - Source for the three points above: [Photon blog](https://blog.photonengine.com/r-e-p-o-multiplayer-success-powered-by-photon/)
- **Content Warning:**
  - Five developers, Feb-Apr 2024, mostly during an internal game jam in Seoul. Free for the first 24h (~6.2M claims), 200k+ CCU in under 24h, and 1M+ sales by mid-April — [Wikipedia](https://en.wikipedia.org/wiki/Content_Warning)
  - Photon capped Landfall's PUN/Voice instances at 4-player rooms. Mods swap in their own Photon AppIDs (free Photon instances allow 16) — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3228576015); [SelfSufficient mod](https://github.com/C0mputery/SelfSufficient)
- **Liar's Bar:**
  - Built in Unity by Curve Animation; peaked above 100k CCU; won the 2024 Steam Award for Most Innovative Gameplay — [Wikipedia](https://en.wikipedia.org/wiki/Liar%27s_Bar)
  - Uses Mirror. Mirror's README lists it as a showcase game and says 1,000+ Steam games use Mirror — [Mirror GitHub](https://github.com/MirrorNetworking/Mirror)
- **Among Us:**
  - Unity case study: servers hosted on Unity Multiplay. Peak of 60M DAU; the game "wasn't built to handle such numbers". Unity's partner praised the service for putting "our small dev team's needs above all else" — [Unity case study](https://unity.com/resources/innersloth-among-us)
  - Hazel is a C# reliable-UDP library, which the README ties to Among Us's launch — [Hazel-Networking](https://github.com/willardf/Hazel-Networking)
- **Fall Guys:** Mediatonic used Unity for 60-player physics battle royale using "a hand-modified version of the UNet networking library". Synchronising animation for 60 players was hard — [The Multiplayer Group case study](https://www.themultiplayergroup.com/case-studies/fall-guys) (search-snippet text; the page body did not load)
- **Human: Fall Flat:**
  - Built in Unity; physics puzzle game where players grab and climb with both arms — [Wikipedia](https://en.wikipedia.org/wiki/Human:_Fall_Flat)
  - Up to 8 players online; one player hosts a lobby — [Steam news](https://store.steampowered.com/news/app/477160/view/4549154898508826446); [Co-Optimus](https://www.co-optimus.com/game/4259/pc/human-fall-flat.html)
  - Multiplayer active-ragdoll tutorials (e.g., Photon Fusion) copy its approach — [Pretty Fly Games](https://prettyflygames.com/tutorial-series-how-to-make-an-active-ragdoll-with-multiplayer-support-in-unity/)
- **Gorilla Tag:** Unity case study: "Switching to URP was a big help". Targets ~90 fps on Quest 2 and uses Unity Build Automation, Addressables and a two-week live-ops cadence. Monetization is cosmetics only — [Unity blog](https://unity.com/blog/another-axiom-gorilla-tag)
- **Not Unity:**
  - Buckshot Roulette was built in Godot. Klubnika moved from Unity to Godot after the Sept 2023 runtime-fee announcement — [Wikipedia](https://en.wikipedia.org/wiki/Buckshot_Roulette); [Godot showcase](https://godotengine.org/article/godot-showcase-buckshot-roulette/)
  - Only Up! was built in Unreal Engine 5 — [Wikipedia](https://en.wikipedia.org/wiki/Only_Up!)
  - Chained Together was built in Unreal Engine 5, with a physics-simulated chain and up to 4 players — [80.lv](https://80.lv/articles/unreal-powered-co-op-game-that-chains-players-together); [Wikipedia](https://en.wikipedia.org/wiki/Chained_Together)
- **Goose Goose Duck:** Social deduction for up to 16 players, released 3 Oct 2021 by Gaggle Studios. No source confirms its engine — [Steam](https://store.steampowered.com/app/1568590/Goose_Goose_Duck/)

### Inferences
- These hits won on concept and moment-to-moment comedy, not netcode sophistication. All of them shipped:
  - host- or relay-based sessions
  - Steam or Photon for NAT traversal
  - proximity or voice chat (Photon Voice in R.E.P.O.)
  - 4-player caps, in most cases (PEAK, Content Warning, Chained Together)
- Going to 8 players plus bots is achievable but is above the genre norm, so budget bandwidth and physics sync for it.
- **Physics sync is the recurring pain point** (R.E.P.O. quote; Fall Guys needed a networking consultancy). The design should limit how many rigidbodies are networked at once and prefer authority-driven "comedic physics" over fully synced ragdoll-to-ragdoll interaction.
- Visual precedent splits two ways. Lethal Company used a stylized HDRP look. Gorilla Tag, and Unity's own 2026 strategy (Q3), point to URP. For a new project that needs top-tier visuals and long support, URP is the safer 2026 choice.

### Gaps
- Not found: render pipeline and character-controller details for PEAK, R.E.P.O., Content Warning, Liar's Bar and Human: Fall Flat. PCGamingWiki, which lists engine and middleware, blocked automated access behind a Cloudflare challenge. SteamDB tech detection was not retrievable.
- Human: Fall Flat's networking library is undocumented.
- Gorilla Tag's netcode is not stated in any source fetched (widely assumed to be Photon, unverified).
- Goose Goose Duck's engine is unconfirmed.
- No first-party Zeekerss statement on Lethal Company's tech was found; he rarely gives interviews ([GamesRadar+](https://www.gamesradar.com/games/horror/life-after-lethal-company-solo-creator-zeekerss-says-weirdly-not-a-lot-has-changed-after-one-of-the-biggest-indie-hits-in-recent-memory-and-he-still-has-a-good-handful-of-ideas-for-games/)).
- Fall Guys' current (post-Epic) stack was not researched.

## Q2. 2026 netcode options compared (NGO + DA + UGS, Netcode for Entities, Mirror, FishNet, Photon Fusion 2, Steam transports)

### Takeaway
For an 8-player co-op/betrayal game on Steam with bots and hidden roles, there are three reasonable choices:
- **Host-authoritative client-server:** NGO 2.x on Unity 6.3 LTS, or FishNet/Mirror, over a Steam transport. Steam Datagram Relay is free, handles NAT and hides IPs, and costs nothing per CCU.
- **Photon Fusion 2 host mode:** buys client prediction and physics prediction for a CCU fee.

Distributed Authority is cheap, but it trusts clients and has no single physics simulation. Both are bad fits for secret roles and shared physics. Unity is merging NGO onto Netcode for Entities: NGO 3.0 shipped on 2026-09-14 and requires Unity 6.7.

### Cited Findings
**Netcode for GameObjects (Unity)**
- Supported editors and platforms: Unity 6.0+; Windows, macOS, Linux, iOS, Android, XR, most consoles and WebGL — [NGO 3.0 docs](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.0/manual/index.html)
- NGO 3.0.0 was released on 2026-09-14:
  - It takes a hard dependency on Netcode for Entities 7.0.0, which also pulls in Entities, Burst and Collections.
  - Assemblies and namespaces are renamed, and previously obsolete APIs are now compile errors.
  - The minimum editor is Unity 6000.7.0b1.
  - 2.x "will continue to support, update, and backport" fixes for Unity 6.6 and below until their end of life.
  - Sources: [Unity Discussions announcement](https://discussions.unity.com/t/netcode-for-gameobjects-3-0-0-is-now-available/1736792); [GitHub release](https://github.com/Unity-Technologies/com.unity.netcode.gameobjects/releases/tag/NGOv3.0.0)
- **Distributed Authority (DA):**
  - Object authority is spread across clients. A "session owner" handles global state and is automatically re-selected if it leaves (built-in host migration).
  - "There's typically no single physics simulation governing the interaction of all objects."
  - Unity warns it "can be easier for bad actors to cheat" and that DA is not suitable for "high-performance competitive games that require an accurate predictive motion model".
  - Source: [NGO DA docs 2.13](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/distributed-authority.html)
- Unity's physics guidance for NGO: simulate physics on the server and only sync transforms to clients (strip Rigidbodies on clients) — [NGO FAQ](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/manual/learn/faq.html) (search snippet)
- **Multiplayer Services (MPS) SDK "sessions":**
  - Wraps Relay, DA, Lobby, Matchmaker and Cloud Code, and bills against those services.
  - Connection types: Relay, Distributed Authority, or Direct (IP and port).
  - Supports Quick Join, session browsing and join codes.
  - Sources: [Unity MPS docs](https://docs.unity.com/en-us/mps-sdk); [Multiplayer Sessions Building Block](https://docs.unity3d.com/6000.4/Documentation/Manual/building-blocks-multiplayer-sessions.html)
- **UGS pricing (live page):**

  | Service | Free tier | Overage |
  |---|---|---|
  | Relay | First 50 average monthly CCU; bandwidth 3 GiB per CCU, up to 150 GiB/month | $0.16 per additional average CCU; $0.09/GiB US+EU, $0.16/GiB Asia+AU |
  | Lobby | 10 GiB/month per region group | $0.09/GiB US+EU, $0.16/GiB Asia+AU |
  | Distributed Authority | 6,000 connectivity hours/month; 100 GiB bandwidth | $0.001 per connectivity hour |
  | Vivox voice | 5,000 PCU | From $2,000 per 5,000 PCU |
  | Authentication | Free | – |

  Source: [UGS pricing](https://unity.com/products/gaming-services/pricing)
- **Multiplay Game Server Hosting was deprecated on 1 April 2026.** Unity-run hosting transitioned to Rocket Science Group. Matchmaker continues with Relay and DA — [Unity status notice](https://status.unity.com/info_notices/362941); [Matchmaker migration doc](https://docs.unity.com/en-us/matchmaker/multiplay-hosting-migration); [AccelByte](https://accelbyte.io/blog/unity-multiplay-is-transitioning-practical-paths-forward-for-multiplayer-studios-using-or-evaluating-multiplay)
- **Steam with NGO:**
  - The community Facepunch transport sends packets over Steam sockets, using the SteamId as the address instead of a UDP port.
  - It installs from multiplayer-community-contributions, and Lethal Company uses it (Q1).
  - Sources: [Steam_NGO_Example](https://github.com/SurajSSingh/Steam_NGO_Example); [MrRobin guide](https://github.com/MrRobinOfficial/Guide-UnitySteamNetcodeGameObjects)

**Netcode for Entities**
- DOTS/ECS; dedicated servers; full prediction and rollback with "ghosts"; handles large entity counts — [dev.to 2026 comparison](https://dev.to/gamedevtoollab/choosing-the-right-real-time-networking-stack-for-unity-in-2026-29f4) (secondary blog dated 2026-09-04)
- It now underpins NGO 3.0 (see above).

**Mirror**
- MIT license and server-authoritative client-server with host mode. Features: RPCs/SyncVars, snapshot interpolation, lag compensation (beta), transform and physics sync.
- Transports: KCP, TCP and WebSockets built in; Steam via community FizzySteam/FizzyFacepunch; a self-hosted relay (Light Reflective Mirror).
- Claims "over 100 million players" and 1,000+ Steam games.
- Source for the points above: [Mirror GitHub](https://github.com/MirrorNetworking/Mirror)
- Current version v96.11.2, with lag compensation still in beta — [dev.to](https://dev.to/gamedevtoollab/choosing-the-right-real-time-networking-stack-for-unity-in-2026-29f4)

**FishNet**
- v4.7.2R: server authority, built-in prediction/reconciliation, flexible transports, source access.
- Its license permits games but restricts competing networking middleware; legal review is advised for unusual deployments.
- Source: [dev.to](https://dev.to/gamedevtoollab/choosing-the-right-real-time-networking-stack-for-unity-in-2026-29f4)
- **FishySteamworks** (built on Steamworks.NET): lets a client act as host in peer-to-peer mode without revealing IP addresses — [FishNet docs](https://fish-networking.gitbook.io/docs/fishnet-building-blocks/transports/fishysteamworks); [GitHub](https://github.com/FirstGearGames/FishySteamworks)

**Photon**
- **Fusion 2(.1)** topologies: Dedicated Server, Client-Host, and Shared (distributed authority) — [Photon: choose mode](https://doc.photonengine.com/fusion/v2/fusion-choose)
  - Client prediction with resimulation and lag compensation — [dev.to](https://dev.to/gamedevtoollab/choosing-the-right-real-time-networking-stack-for-unity-in-2026-29f4)
  - The Physics addon's NetworkRigidbody predicts rigidbodies but works only in Host or Server mode, not Shared — [Photon physics addon](https://doc.photonengine.com/fusion/current/addons/physics/overview)
  - When a direct connection fails, players fall back to a relay; Photon puts this at about 1 in 10 players — [Photon topologies](https://doc.photonengine.com/fusion/current/manual/network-topologies)
- **Fusion pricing:**

  | Plan | Price | Traffic / notes |
  |---|---|---|
  | Free | $0 | 20 CCU, development only, 60 GB |
  | 100 CCU | $95 one-time, 12 months | 0.3 TB |
  | 500 CCU | $125/month | 1.5 TB |
  | 1,000 CCU | $250/month | 3 TB |
  | 2,000 CCU | $500/month | 6 TB |
  | Premium | $0.50/CCU, $1,000/month minimum | – |

  Traffic overage is $0.05/GB in NA/EU and $0.10/GB in APAC. CCU bursts are allowed for 48h before you must upgrade — [Photon Fusion pricing](https://www.photonengine.com/fusion/pricing)
- **PUN 2** (what R.E.P.O., Content Warning and PEAK use) is in maintenance/LTS mode with no new features. Photon recommends Fusion for new projects — [Photon PUN docs FAQ](https://doc.photonengine.com/pun/current/troubleshooting/faq); [Photon forum](https://forum.photonengine.com/discussion/19306/pun-2-or-fusion)

**Steam networking (transport layer)**
- Steam Datagram Relay (SDR) routes traffic over Valve's backbone. It hides IPs, protects against attacks, gives "100% reliable NAT traversal", and often improves ping.
- It is reachable when the game has a version shipping on Steam.
- APIs: ISteamNetworkingSockets (connection-oriented, also plain UDP for testing), ISteamNetworkingMessages (UDP-style) and FakeIP.
- Sources: [Steamworks SDR](https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay); [Steam Networking](https://partner.steamgames.com/doc/features/multiplayer/networking)
- There is also an open-source implementation — [GameNetworkingSockets](https://github.com/valvesoftware/gamenetworkingsockets)

**Evaluation advice (secondary source)**
- Split the decision into separate layers: transport, netcode, session, hosting and backend.
- Run 1-2 week proofs of concept on at most two candidates, under 100-200 ms RTT with packet loss and jitter.
- Send inputs rather than results.
- Estimate average CCU ≈ DAU × sessions per day × minutes connected / 1,440.
- Source: [dev.to 2026](https://dev.to/gamedevtoollab/choosing-the-right-real-time-networking-stack-for-unity-in-2026-29f4)
- Netcode benchmark repo comparing Fusion, FishNet, Mirror, Mirage, Netick and NGO — [StinkySteak/unity-netcode-benchmark](https://github.com/StinkySteak/unity-netcode-benchmark)

### Inferences
- **Hidden roles and betrayal need one authority.** Role assignment, win checks, votes and sabotage outcomes should live only on the host or server, with role information sent only to each role's owner. DA and Photon Shared mode give clients authority over their own objects, which makes hiding information and resisting cheats harder (Unity's own warning). Host-authoritative client-server is the right model.
- **Bots:** no library ships a bot/AI-seat framework; bot support comes from the topology. In host-authoritative stacks, bots are just host-owned NetworkObjects driven by host-side AI (NavMesh plus behavior or utility AI) and replicated like players. This also lets one person run an "8-player" session solo. The drawback: all bot AI runs on the host machine, so profile for 7 bots plus physics.
- **Cost:** the cheapest path is host plus Steam SDR through a Facepunch or Steamworks.NET transport, at $0 per CCU. For LAN, use Unity Transport direct IP (the MPS "Direct" connection type). Unity Relay is free up to 50 average CCU and is only needed if you ship off Steam or want join codes without Steam.
- **Photon trade-off:** Fusion has better physics and prediction, but past the free development tier every tier is capped by CCU. Photon's own blog says PUN left R.E.P.O. to fight physics smoothing by hand.
- **Library choice:**
  - **NGO 2.x on 6.3 LTS:** official, with Multiplayer Play Mode integration and Unity samples. Weakest client prediction; the 3.0 migration is coming.
  - **FishNet:** built-in prediction, a good fit for a physics-heavy co-op game.
  - **Mirror:** the most battle-tested MIT option (Liar's Bar).
  - **Photon Fusion 2 host mode:** best out-of-the-box physics prediction, at a CCU cost.
- **Physics recommendation:** keep characters kinematic or using a character controller, with server-side physics for props. Use cosmetic client-side active-ragdoll layers (animation-driven physics that is not networked) to get Human: Fall Flat or PEAK-style comedy without syncing every bone.

### Gaps
- No first-party comparison of NGO vs FishNet vs Mirror physics sync quality at 8 players was found; a Reddit comparison query returned nothing useful.
- Mirror/FishNet version numbers come from a single 2026 secondary blog, not their release pages.
- DA player-count limits are not documented.
- It is unclear whether NGO 3.0 changes prediction or physics features; the announcement covers only structural changes.
- No UGS Matchmaker pricing was retrieved.

## Q3. Unity 6 version recommendation (2026 LTS line), licensing, build targets, render pipeline

### Takeaway
- **Version:** start on **Unity 6.3 LTS**. It is the current LTS (released 4 Dec 2025, supported to Dec 2027; latest patch 6000.3.25f1). Unity 6.0 LTS support ends 16 Oct 2026. Unity 6.7 LTS (in beta, 6000.7.0b1) is expected late 2026 and is the minimum for NGO 3.0.
- **Pipeline:** use **URP**. Unity has put HDRP into maintenance and deprecated Built-in RP starting in 6.5.
- **Licensing:** Personal stays free under $200k revenue plus funding. The runtime fee is cancelled. Pro costs $2,310/seat/year from 12 Jan 2026.

### Cited Findings
- **Versions:**
  - Unity 6.3 LTS is the first LTS since 6.0, released December 2025, with two-year support to December 2027 (+1 year for Enterprise and Industry) — [Unity blog](https://unity.com/blog/unity-6-3-lts-is-now-available); [Unity 6 support page](https://unity.com/releases/unity-6/support)
  - Release timeline — [endoflife.date](https://endoflife.date/unity):

    | Version | Released | Type | Support ends | Latest patch |
    |---|---|---|---|---|
    | 6.0 | 29 Apr 2024 | LTS | 16 Oct 2026 | 6000.0.84f1 |
    | 6.3 | 4 Dec 2025 | LTS | 4 Dec 2027 | 6000.3.25f1 |
    | 6.4 | 18 Mar 2026 | Update | Superseded | – |
    | 6.5 | 15 Jun 2026 | Update | Superseded | – |
    | 6.6 | 31 Aug 2026 | Update (newest) | Next release | 6000.6.3f1 |

  - Update releases are "fully production-ready" and patched weekly, but supported only until the next release — [Unity 6 support page](https://unity.com/releases/unity-6/support)
  - A secondary blog (2026-09-18) recommends 6.3 LTS for production and 6.6 for prototyping. It says 6.7 LTS is expected later in 2026 and that "Unity 7" will be 6.8 with no breaking changes in Q1 2027 (the last claim is unverified here) — [makaka.org](https://makaka.org/unity-tutorials/best-version)
  - NGO 3.0 requires Unity 6000.7.0b1+, which confirms 6.7 was in beta in Sept 2026 — [Unity Discussions](https://discussions.unity.com/t/netcode-for-gameobjects-3-0-0-is-now-available/1736792)
- **Licensing:**
  - Runtime Fee cancelled in Sept 2024 — [Unity blog](https://unity.com/blog/unity-is-canceling-the-runtime-fee); [Game Developer](https://www.gamedeveloper.com/business/unity-is-killing-its-controversial-runtime-fee)
  - Unity Personal is free, with the revenue-plus-funding ceiling doubled to $200,000 from the Unity 6 release (17 Oct 2024). The "Made with Unity" splash screen is optional for Personal on Unity 6 — [CG Channel 2024](https://www.cgchannel.com/2024/09/unity-scraps-controversial-runtime-fee-but-raises-prices/); [Unity blog](https://unity.com/blog/terms-update-runtime-fee-cancellation)
  - Pro is $2,310/yr ($210/month) from 12 Jan 2026, a 5% rise.
  - Unity Version Control free tier: unlimited seats and 25GB storage.
  - Unity Build Automation free tier: now covers macOS and iOS, with 100 free Mac build minutes.
  - Havok Physics was dropped from Pro, Enterprise and Industry subscriptions starting with 6.3 LTS; it is now a paid add-on.
  - Source for the last four points: [CG Channel Nov 2025](https://www.cgchannel.com/2025/11/price-of-paid-unity-subscriptions-to-rise-but-free-subs-extended/); [80.lv](https://80.lv/articles/unity-announces-its-upcoming-2026-price-changes)
- **Render pipelines, Unity's 2026 strategy:**
  - HDRP will be maintained "focusing only on expanding platform reach with Nintendo Switch 2 support and stability", with no new features.
  - URP is gaining physical light units, auto exposure, physical/dynamic sky, real-time GI, SSR and on-tile post-processing.
  - Built-in RP was deprecated in 6.5 and is guaranteed through Unity 6.7 LTS.
  - "We strongly encourage using URP when starting any new project."
  - Sources: [Unity render pipelines strategy](https://unity.com/topics/render-pipelines-strategy-for-2026); [80.lv](https://80.lv/articles/unity-unveils-2026-render-pipelines-strategy)
- **Build targets:**
  - NGO supports Windows, macOS, Linux, iOS, Android, XR, most consoles and WebGL — [NGO docs](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.0/manual/index.html)
  - Unity exposes a Server subtarget (`-standaloneBuildSubtarget Server`) for dedicated/headless builds — [Unity CLI manual](https://docs.unity3d.com/6000.3/Documentation/Manual/EditorCommandLineArguments.html)

### Inferences
- **Version plan:** begin on 6.3 LTS with NGO 2.x (or FishNet/Mirror, which do not depend on the Unity version). Plan one upgrade to 6.7 LTS in early-to-mid 2027 once it has patches, which is also when NGO 3.0 becomes available.
- **Why not 6.6:** starting on 6.6 gains little and moves the project onto the update-release treadmill.
- **Visuals:** URP plus Unity 6 features (GPU Resident Drawer, APV, VFX Graph, Shader Graph) is the forward path for "top-tier visuals". Lethal Company's HDRP look is achievable in URP with custom post-processing. Choosing HDRP now means building on a pipeline in maintenance mode.
- **Platforms:** ship Windows (Steam) first. Linux/Steam Deck and consoles are later; Steam transports won't work cross-store without a second transport (e.g., Unity Relay or Epic).
- **Licensing:** the revenue-plus-funding threshold matters. Crossing $200k (including funding) forces Pro seats, at $2,310 per seat per year.

### Gaps
- Exact 6.7 LTS release date not found.
- Steam Deck and Linux specifics for Unity 6.3 were not researched.
- The "Unity 7 = 6.8" claim comes from one secondary source.

## Q4. Testing multiplayer locally and in automation

### Takeaway
- **Local, in the editor:** use Unity's **Multiplayer Play Mode (MPPM)** for up to 4 players (the main editor plus 3 virtual players). Play Mode Scenarios add local build instances (host, clients, server).
- **Local, 8 players:** combine build instances with bots. ParrelSync is the legacy clone-project alternative and can't be combined with MPPM.
- **CI:** use the Unity Test Framework CLI: `-runTests -batchmode -testPlatform EditMode|PlayMode -testResults`. For builds, use `-executeMethod`/`-activeBuildProfile` with `-nographics` in batch mode. GameCI covers Docker/GitHub Actions and supports Personal licenses.

### Cited Findings
- **Multiplayer Play Mode:**
  - MPPM simulates up to four players (one editor plus three virtual players) on one machine from the same assets — [Multiplayer Play Mode docs](https://docs-multiplayer.unity3d.com/mppm/0.6.0/about/)
  - You can't use MPPM and ParrelSync together — [Meta dev docs](https://developers.meta.com/horizon/documentation/unity/unity-multiplayer-testing/)
- **Play Mode Scenarios:**
  - Need the Multiplayer Play Mode and Dedicated Server packages and Unity 6000.0.3f1+. They work with NGO, Netcode for Entities and Multiplayer Tools.
  - Local instances run only on macOS, Linux, Windows and Android, and need a Build Profile matching the project platform. Pause/Step and Play Mode shortcuts don't work for local targets.
  - Source for the two points above: [MPPM 1.6 requirements](https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/play-mode-scenario/play-mode-scenario-req.html)
  - Example scenarios: editor host plus editor client over Relay; editor host plus local build client; editor client to a local server build by direct IP — [MPPM scenario examples](https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/play-mode-scenario/play-mode-scenario-examples.html)
- **ParrelSync:**
  - Clones the project folder and symlinks Assets, Packages and ProjectSettings so extra editors mirror changes — [ParrelSync GitHub](https://github.com/VeriorPies/ParrelSync)
  - Unity's samples replaced ParrelSync with MPPM — [Meta dev docs](https://developers.meta.com/horizon/documentation/unity/unity-multiplayer-testing/); [Unity samples PR](https://github.com/Unity-Technologies/com.unity.multiplayer.samples.bitesize/pull/218)
- **Unity Test Framework CLI:**
  - `-runTests` starts a test job when the editor loads and returns a non-zero exit code on failure.
  - `-testPlatform PlayMode` runs Play Mode tests in the editor; a BuildTarget value runs them on a player; omitted, tests run in Edit Mode.
  - `-testResults` writes NUnit XML, and `-batchmode` suppresses pop-ups.
  - Source: [UTF command line docs](https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/reference-command-line.html); [Unity 6.3 manual](https://docs.unity3d.com/6000.3/Documentation/Manual/test-framework/run-tests-from-command-line.html)
- **Editor CLI flags:**

  | Flag | What it does |
  |---|---|
  | `-batchmode` | No human interaction |
  | `-nographics` | Runs "on machines that don't have a GPU" |
  | `-executeMethod` | Runs a static method on project open |
  | `-quit` | Exits after other commands; limits apply with async code |
  | `-buildTarget` | Selects the build platform |
  | `-logFile -` | Logs to the console |
  | `-activeBuildProfile` / `-build` | Sets the build profile and output path |
  | `-standaloneBuildSubtarget Server` | Headless server builds |

  Source: [Unity 6.3 command line arguments](https://docs.unity3d.com/6000.3/Documentation/Manual/EditorCommandLineArguments.html)
- **GameCI unity-test-runner:**
  - `testMode` takes EditMode, PlayMode, All (the default, which runs both) or Standalone (must be named explicitly).
  - Uses `unityci/editor` Docker images.
  - Personal licenses work after a one-time manual activation, using `UNITY_LICENSE`, `UNITY_EMAIL` and `UNITY_PASSWORD` secrets (Pro uses `UNITY_SERIAL`).
  - Sources: [GameCI docs](https://game.ci/docs/github/test-runner/); [GameCI GitHub](https://github.com/game-ci)
- **Conflict:** an older Unity forum answer says PlayMode tests can't run in batch mode because coroutines and async aren't supported ([Unity Discussions](https://discussions.unity.com/t/gitlab-ci-and-playmode-tests/802420)). This is contradicted by the UTF docs, which document `-batchmode -testPlatform PlayMode`, and by GameCI running PlayMode in Docker. There are known edge cases, such as runs getting stuck in "Testing in playmode" ([GameCI issue #188](https://github.com/game-ci/unity-test-runner/issues/188)) and PlayMode runs failing on a second invocation ([Unity Discussions](https://discussions.unity.com/t/test-framework-unable-to-run-playmode-tests-via-command-line-more-than-once/890077)).

### Inferences
- **Test loop for an 8-seat game:**
  1. MPPM with 1 host editor and 3 virtual clients for day-to-day work.
  2. Bots fill the remaining 4 seats, which exercises the bot-as-player path every session.
  3. Occasional full 8-client runs from a Windows build launched with command-line flags: `-batchmode -nographics` for bot-only headless clients, or windowed builds.
  4. A final pass over real Steam with 2+ accounts before release, because the Steam transport needs Steam running and can't be fully simulated in MPPM.
- **Automated pipeline:**
  - EditMode tests for pure logic: role assignment, vote tallying, door/room generation seeds, economy.
  - PlayMode tests that start an NGO host plus in-process clients over a local transport and assert that replicated state converges.
  - A headless "bot soak" build that runs N full matches with all-bot seats and checks for exceptions, desyncs and stuck win conditions.
  - GitHub Actions + GameCI (Personal license is fine), or local `Unity.exe -batchmode -runTests` scripts that AI agents can call.
- **Deterministic seeds:** give room and door generation a deterministic seed so bot soak failures can be replayed.

### Gaps
- No official documentation was found for an NGO in-process multi-client test harness in UTF. NGO's own repo has a test framework, not examined here.
- Whether MPPM can go past 4 players in 2026 versions was not confirmed; the docs found say 4.
- Unity's Multiplayer Tools network simulator (latency and packet-loss presets) was not researched.

## Fact-check (independent)

Checked 2026-09-28 by an independent pass against primary sources where reachable. Photon docs (doc.photonengine.com) were behind a Gcore challenge, so the Photon doc items rely on search-result text.

### CONFIRMED
- **NGO 3.0.0:** hard dependency on Netcode for Entities 7.0.0 (brings in Entities, Burst and Collections). Minimum editor Unity 6000.7.0b1. 2.x keeps getting fixes "for earlier Editor versions until their end of life". The changelog header reads `[3.0.0] - 2026-09-14`. The forum announcement is dated 17 Sep 2026 and the GitHub release is dated 21 Sep, so "shipped 14 Sep" matches the changelog date, not the public announcement. Sources: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.0/changelog/CHANGELOG.html ; https://discussions.unity.com/t/netcode-for-gameobjects-3-0-0-is-now-available/1736792
- **Unity 6.3 LTS:** released 4 Dec 2025, with 2 years of support (+1 year for Enterprise/Industry). It is the first LTS since 6.0. Latest patch 6000.3.25f1; 6.0 support ends 16 Oct 2026 (latest 6000.0.84f1); 6.6 released 31 Aug 2026 (6000.6.3f1). Sources: https://unity.com/blog/unity-6-3-lts-is-now-available ; https://endoflife.date/unity
- **Unity pricing:**
  - Pro costs $2,310/yr from 12 Jan 2026 (+5%).
  - Unity Version Control free tier: unlimited seats and 25GB.
  - Build Automation free tier: adds macOS/iOS with 100 free Mac minutes.
  - Havok is dropped from paid subscriptions from 6.3 LTS and is now a paid add-on.
  - Source: https://www.cgchannel.com/2025/11/price-of-paid-unity-subscriptions-to-rise-but-free-subs-extended/
- **Personal licence and runtime fee:** the Personal threshold is $200k, from the Unity 6 release. The splash screen is no longer required, and the runtime fee was cancelled in Sep 2024. Source: https://www.cgchannel.com/2024/09/unity-scraps-controversial-runtime-fee-but-raises-prices/
- **Render pipeline strategy:**
  - HDRP is maintained only for Switch 2 support and stability.
  - Built-in RP is deprecated in 6.5 and still available in 6.7 LTS, with support at least to the end of 2028.
  - Unity: "strongly encourage using URP when starting any new project".
  - Source: https://unity.com/topics/render-pipelines-strategy-for-2026
- **UGS pricing:** every Relay, Lobby, DA, Vivox and Auth figure in the table matches. Extra detail: DA bandwidth over 100 GiB is $0.09/GiB (Americas/EU) and $0.16/GiB (Asia/AU). Source: https://unity.com/products/gaming-services/pricing
- **Multiplay:** Game Server Hosting by Unity was deprecated as of 1 Apr 2026, and the migration path is "Multiplay by Rocket Science". Source: https://status.unity.com/info_notices/362941
- **Distributed Authority quotes:** all verbatim, including no single physics simulation, bad actors can cheat more easily, not for predictive competitive games, and automatic session-owner re-selection. Source: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/distributed-authority.html
- **R.E.P.O.:** used Photon PUN + Voice on Landfall's recommendation. The physics-struggle quote is verbatim, and the article cites ~8.7M sales in March. Source: https://blog.photonengine.com/r-e-p-o-multiplayer-success-powered-by-photon/
- **Liar's Bar:** uses Mirror and is a Mirror showcase game. Mirror is MIT, has 1000+ Steam games and lag compensation still in Beta. Source: https://github.com/MirrorNetworking/Mirror
- **Lethal Company:**
  - Uses NGO + the Facepunch transport (from Unity's multiplayer-community-contributions repo, Facepunch.Steamworks 2.3.2).
  - The LethalSDK project recommends Unity 2022.3.9 and ships an HDRP profile.
  - Extra, from a search snippet about modding templates: voice chat is Dissonance VOIP, not Photon Voice.
  - Sources: https://github.com/Unity-Technologies/multiplayer-community-contributions/tree/main/Transports/com.community.netcode.transport.facepunch ; https://github.com/HolographicWings/LethalSDK-Unity-Project
- **PEAK:**
  - Built in Unity, up to 4 players, released 16 Jun 2025.
  - Made by 3 Aggro Crab + 4 Landfall staff over a one-month jam in Seoul (Feb 2025).
  - The Landfall FAQ confirms Photon relays hide IPs.
  - Sources: https://en.wikipedia.org/wiki/Peak_(video_game) ; https://www.pcgamer.com/games/sim/peak-devs-say-the-hit-comedy-climber-was-pitched-in-a-swedish-hot-tub-and-developed-in-a-frantic-4-week-korean-game-jam-we-brought-our-computers-to-an-airbnb-in-hongdae-and-locked-tf-in-for-a-month/ ; https://landfall.se/peak-faq
- **Among Us:** Multiplay hosted its servers, with a 60M peak DAU. The Hazel README says "Among Us uses it for all platforms". Sources: https://unity.com/resources/innersloth-among-us ; https://github.com/willardf/Hazel-Networking
- **Non-Unity games:**
  - Buckshot Roulette is built in Godot, and Klubnika switched from Unity because of the runtime fee.
  - Only Up! is built in UE5.
  - Chained Together is built in Unreal; Wikipedia does not name the engine, but the dev's own posts tag #UE5.
  - Sources: https://godotengine.org/article/godot-showcase-buckshot-roulette/ ; https://en.wikipedia.org/wiki/Only_Up! ; https://80.lv/articles/unreal-powered-co-op-game-that-chains-players-together
- **Fall Guys:** "hand-modified version of the UNet networking library" (confirmed via search snippet only). Source: https://www.themultiplayergroup.com/case-studies/fall-guys
- **Content Warning:** 5 devs, Feb-Apr 2024, ~6.2M free claims, 200k+ CCU and 1M+ sales. Source: https://en.wikipedia.org/wiki/Content_Warning
- **Editor CLI flags:** all exist with these exact spellings in the 6.3 manual: `-batchmode`, `-nographics`, `-executeMethod`, `-quit`, `-buildTarget`, `-logFile`, `-activeBuildProfile`, `-build`, and `-standaloneBuildSubtarget` (Player|Server). Source: https://docs.unity3d.com/6000.3/Documentation/Manual/EditorCommandLineArguments.html
- **UTF CLI:** `-runTests` and `-testPlatform` behave as described; when the platform is omitted, tests run in EditMode. `-testResults` writes NUnit XML. Source: https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/reference-command-line.html
- **GameCI:**
  - `testMode` takes All, PlayMode, EditMode or Standalone. The default is All, which does not include Standalone.
  - A Personal licence needs the `UNITY_LICENSE`, `UNITY_EMAIL` and `UNITY_PASSWORD` secrets; Pro uses `UNITY_SERIAL` in place of `UNITY_LICENSE`.
  - Source: https://game.ci/docs/github/test-runner/
- **MPPM:** up to 4 editor Players (main plus 3 virtual). Source: https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/index.html
- **PUN 2:** in maintenance/LTS mode, and Photon recommends Fusion for new projects (search snippet of Photon docs). Source: https://forum.photonengine.com/discussion/19306/pun-2-or-fusion
- **Fusion physics:** NetworkRigidbody prediction works only in Client-Host or Dedicated Server modes; Shared mode uses Forecast Physics (search snippet). Source: https://doc.photonengine.com/fusion/v2/addons/physics-addon-2.1
- **Steam SDR:** hides IPs, and a version of the game must ship on Steam. The phrase "100% reliable NAT traversal" is real but comes from Valve's GameNetworkingSockets / SDK v1.44 announcement, not the SDR partner page cited. Sources: https://partner.steamgames.com/doc/features/multiplayer/steamdatagramrelay ; https://steamcommunity.com/groups/steamworks/announcements/detail/1791775741704351698
- **FishNet licence:** free for commercial games. The restriction is that "Other products of like Software (explicitly networking solutions) may not use, reverse engineer, or implement Software". Source: https://github.com/FirstGearGames/FishNet/blob/main/LICENSE.md

### CORRECTED
- **Mirror player count:** the README says "used by over **200** million players", not 100 million. Source: https://github.com/MirrorNetworking/Mirror
- **Mirror version:** the latest release is **v96.11.3** (17 Sep 2026), not v96.11.2. Source: https://github.com/MirrorNetworking/Mirror/releases
- **FishNet version:** the latest release is **4.7.3R**, not 4.7.2R. Source: https://github.com/FirstGearGames/FishNet/releases
- **Photon Fusion pricing table:**
  - It omits a **Free 100 CCU plan** (free, one app per customer, 0.3 TB/month), which sits alongside the 20 CCU development-only tier. The Q2 inference that "past the free development tier every tier is capped by CCU" should be read with this in mind, because an 8-player indie can launch on free 100 CCU.
  - The **CCU burst is included only on the 500/1,000/2,000 CCU monthly plans**; the free and 100 CCU plans have no burst.
  - Source: https://www.photonengine.com/fusion/pricing
- **Unity 6.0 "released 29 Apr 2024":** that date is the Unity 6 Preview. Unity 6 (6.0 LTS, 6000.0.23f1) went GA on **17 Oct 2024**, which fits the 16 Oct 2026 end of support. Sources: https://unity.com/news/unity-6-will-release-globally-october-17-2024-unity-announces-at-annual-unite-developer-conference ; https://unity.com/blog/unity-6-3-lts-is-now-available
- **MPPM 1.6 limits:** alongside the 4 editor Players, "Up to four locally built instances can also be added". An 8-instance local session (4 editor + 4 builds) is therefore documented, which partly closes the Q4 gap about going past 4. Source: https://docs.unity3d.com/Packages/com.unity.multiplayer.playmode@1.6/manual/index.html
- **Steam SDR cost:** the SDR page lists no price. "Free, $0 per CCU" is an inference (no fee is listed), not a quoted term.

### UNVERIFIED (not checked or no reachable source)
- "Unity 7 = 6.8 in Q1 2027" (makaka.org) and the exact 6.7 LTS date.
- Gorilla Tag's netcode, Goose Goose Duck's engine, and Human: Fall Flat's networking library (all already flagged as gaps).
- Content Warning's 4-player Photon room cap, and the claim that free Photon AppIDs allow 16 (Steam guide and mod repo not re-fetched).
- The Photon topologies claim that "~1 in 10 players fall back to relay" (Photon docs blocked).
- MPS SDK connection types (Relay/DA/Direct) and the NGO FAQ physics guidance (not re-fetched).
