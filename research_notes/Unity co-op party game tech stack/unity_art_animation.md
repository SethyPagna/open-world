# Unity Stylized Art, Animation, VFX, Environment and Audio Pipeline for a Small AI-Driven Team (2025-2026)

Scope note: research done September 2026. Some primary pages (fmod.com/licensing, audiokinetic.com pricing, helpx.adobe.com Mixamo FAQ) refused automated fetches (403 or empty), so a few license figures come from secondary sources and are flagged. Anything not sourced this session is in the Gaps sections, not stated as fact.

## Q1. URP vs HDRP; stylized shading for a premium look; Unity games with standout stylized visuals

### Takeaway
Use URP on Unity 6 (URP 17). HDRP has a documented Steam Deck performance problem. URP 17 has now picked up the main things HDRP used to offer: Adaptive Probe Volumes, the GPU Resident Drawer, STP upscaling and Render Graph. For a premium stylized look, stack a toon or cel lighting model (the Unity Toon Shader, custom Shader Graph, or hand-written HLSL) with outlines, rim light and URP post-processing. The one thing HDRP has that URP lacks is built-in camera-relative rendering, which matters for "scale reveal" moments. In URP it can be solved with a floating origin.

### Cited Findings
- Vendor and agency guidance says URP is usually the better choice for stylized, competitive or live-service games that must run on Steam Deck-class or lower-spec hardware: readable silhouettes, high and stable frame rates, broad compatibility. — [Juego Studio blog](https://www.juegostudio.com/blog/urp-vs-hdrp-vs-built-in) (secondary/vendor source)
- A developer on the Unity forums reported barely breaking 30 FPS on Steam Deck with HDRP, even after very heavy script optimization. — [Unity Discussions: HDRP rendering on Steam Deck](https://discussions.unity.com/t/unity-hdrp-rendering-on-steam-deck/1495611)
- Optimization guidance: treat Steam Deck as "a mobile-class GPU with a desktop-class CPU" and profile deep-profile Development Builds during real gameplay. — [GTStudios Unity 6 performance tips 2026](https://gtstu.com/unity-6-performance-tips/) (secondary)
- URP 17 (Unity 6) supports Adaptive Probe Volumes (APV), which automate light-probe placement for indirect diffuse lighting. It adds Lighting Scenario Blending, sky occlusion and disk streaming. — [Unity Manual: What's new in URP 17](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/whats-new/urp-whats-new.html); [Unity 6 feature announcement](https://unity.com/blog/unity-6-features-announcement)
- URP 17's GPU Resident Drawer automatically uses the BatchRendererGroup API to draw GameObjects with GPU instancing. This cuts draw calls and CPU cost with no manual optimization. Unity pitches it for "larger, more detailed worlds". — [Unity Docs: Enable the GPU Resident Drawer in URP](https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/in-urp/reduce-draw-calls-urp/reduce-rendering-work-on-cpu/gpu-resident-drawer); [Unity 6 announcement](https://unity.com/blog/unity-6-features-announcement)
- STP (Spatial-Temporal Post-processing) renders at lower resolution and upscales. Enable it at URP Asset > Quality > Upscaling Filter > STP. This is directly useful for Steam Deck and mid-range laptops. — [Unity 6 announcement](https://unity.com/blog/unity-6-features-announcement); [What's new in URP 17](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/whats-new/urp-whats-new.html)
- URP now uses a Render Graph framework, with a Render Graph Viewer at Window > Analysis > Render Graph Viewer. Custom render passes (outlines, custom post effects) are written against it. — [What's new in URP 17](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/whats-new/urp-whats-new.html)
- Unity publishes a free e-book, "Introduction to URP for advanced creators (Unity 6 edition)", and calls it the biggest edition yet. — [Unity resource page](https://unity.com/resources/introduction-to-urp-advanced-creators-unity-6); [Unity blog](https://unity.com/blog/biggest-edition-urp-ebook-unity-6)
- The Unity Toon Shader (UTS, successor to Unity-chan Toon Shader 2) works with the Built-in pipeline, URP and HDRP, though feature availability varies by pipeline. It provides outlines, rim light, controllable shade steps, MatCap, highlights, emission and "angel ring" hair highlights. Artists can set base, shade and highlight colors independently of scene lighting. **License: source code under the Unity Companion License; Unity-chan assets under the Unity-Chan License.** — [GitHub: Unity-Technologies/com.unity.toonshader](https://github.com/unity-technologies/com.unity.toonshader)
- The Unity Toon Shader package docs still carry "-preview" version labels (for example 0.11.1-preview). — [Unity Toon Shader docs 0.11](https://docs.unity3d.com/Packages/com.unity.toonshader@0.11/manual/index.html)
- Open-source URP toon shaders exist, such as Delt06/urp-toon-shader and ChiliMilk/URP_Toon. Their licenses were not checked this session. — [Delt06/urp-toon-shader](https://github.com/Delt06/urp-toon-shader); [ChiliMilk/URP_Toon](https://github.com/ChiliMilk/URP_Toon)
- Camera-relative rendering, which replaces the world origin with the camera position so distant objects avoid float-precision z-fighting, is documented as an **HDRP** feature. Searches turned up no URP equivalent. — [HDRP 17 docs: Camera-relative rendering](https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.0/manual/Camera-Relative-Rendering.html)
- The standard engine-agnostic fix is a floating origin: periodically re-center the world on the player to avoid precision loss in large or infinite worlds. — [Wikipedia: Floating origin](https://en.wikipedia.org/wiki/Floating_origin)
- Genre-comparable example: **PEAK** (Aggro Crab + Landfall, released June 16, 2025) is built in Unity, is Steam Deck Verified, sold over 2 million copies in 9 days, and started as a month-long game jam in Seoul. It is a 1-4 player co-op climbing game. — [Wikipedia: Peak (video game)](https://en.wikipedia.org/wiki/Peak_(video_game)); [PEAK Wiki](https://peak.wiki.gg/wiki/Peak_(game)); [Unity blog: Games made with Unity June 2025](https://unity.com/blog/games-made-with-unity-june-2025-releases)
- Example of standout stylized Unity art: **Cult of the Lamb** (Massive Monster, Unity). Unity's own write-up says lighting is a big part of the look (with lighting artist Jonathan Swanson) and that the team built custom solutions for its 2.5D setup. — [Unity Blog: recipe behind Cult of the Lamb](https://unity.com/blog/games/recipe-behind-smash-hit-cult-of-the-lamb)
- Unity's "Fantasy Kingdom" is an official Unity 6 showcase demo. — [Unity demos: Fantasy Kingdom](https://unity.com/demos/fantasy-kingdom)

### Inferences
- For 1-8 players on screen plus AI bots, on mid laptops and Steam Deck, **URP 17 + Forward+ + STP + GPU Resident Drawer + APV** is the pragmatic stack. HDRP's extra features (volumetrics, physically based sky) do not justify the Deck risk shown above.
- A "premium" stylized look comes mostly from art direction and post-processing, not the pipeline. A reasonable stack:
  1. Ramp or step toon lighting with soft shadow bands (UTS, or a custom Shader Graph/HLSL lit function).
  2. Fresnel rim light tinted per team or role, which also helps readability in party games.
  3. Outlines, either inverted-hull on characters or a depth/normal edge-detection pass as a Render Graph renderer feature.
  4. SSAO renderer feature for contact grounding.
  5. Bloom, a color-grading LUT, vignette and depth of field in cinematics.
  6. Height/distance fog plus fake light shafts: billboard or cone meshes with additive shaders, or a screen-space radial-blur pass. URP does not ship HDRP-style volumetric fog.
  7. Stylized water: a depth-fade shader with foam lines, scrolling normals and a vertex wave.
  These are standard techniques. Only the URP/HDRP feature split above is sourced.
- Because development is AI-driven, the Unity Companion License on UTS is fine for use inside a Unity game. However, UTS's preview status and huge parameter surface may be harder for an AI to tune than a small, purpose-written HLSL toon shader the AI owns end to end.
- The "frog in a well" concentric world (Well, then Sky, then Space) should use a floating origin or scaled nested scenes in URP, since camera-relative rendering is HDRP-only per the docs.

### Gaps
- No primary source was found on which render pipeline PEAK, Chained Together, Fall Guys, R.E.P.O., Lethal Company or Content Warning use. I did not verify widely repeated claims (for example "Lethal Company uses HDRP"), so they are left out.
- No verified 2025-2026 sources on Sable, Tunic, A Short Hike or Genshin's stylized rendering. These are commonly cited Unity stylized examples but were not confirmed this session.
- No verified source on URP volumetric fog or light-shaft options (built-in or third-party), or on URP SSAO performance on Steam Deck.
- Asset Store toon shaders (Toony Colors Pro 2, Flat Kit, RealToon) were not checked for price or license.

## Q2. Character creation (bean/frog/creature) and animation pipeline

### Takeaway
Use CC0 libraries (Quaternius, KayKit, Kenney) for placeholder and secondary characters and for large animation sets. Use Mixamo animations where needed: royalty-free, no attribution, but no redistribution of the raw files. Build the signature cute bean/frog heroes as simple custom Blender meshes, and get most of the "life" from procedural layers: Animation Rigging IK and damped transforms, spring bones, and tween-driven squash and stretch. Synty is paid and carries more license restrictions than CC0.

### Cited Findings
- Quaternius, Kenney and KayKit publish their assets as CC0, so no attribution is needed even commercially. — [Cinevva: Best free 3D model sites (2026)](https://app.cinevva.com/guides/free-3d-model-sites) (secondary)
- **Quaternius Universal Animation Library**: "120+ animations" on a universal humanoid rig, for retargeting in Unreal, Godot and Unity. Formats are FBX, GLB and .blend. **License: CC0**, "free to use in personal, educational and commercial projects". Tiers: Standard (free), Pro (paid), Source. Patreon tiers give Source keys. — [Quaternius UAL page](https://quaternius.com/packs/universalanimationlibrary.html). *Conflict:* Cinevva describes the same library as "250+ retargetable clips". — [Cinevva](https://app.cinevva.com/guides/free-3d-model-sites). The difference may be Standard vs Pro content; I could not confirm which.
- **KayKit Character Animations**: 133 humanoid animations meant for KayKit characters. **CC0**, free for personal and commercial use, no attribution. — [KayKit Character Animations (itch.io)](https://kaylousberg.itch.io/kaykit-character-animations)
- KayKit (Kay Lousberg) makes low-poly packs: dungeon kits, adventurer and skeleton character packs, hex terrain and themed "Bits" prop packs. Most are free and CC0, with a paid complete bundle. Character packs ship animated and "rig cleanly". — [Cinevva](https://app.cinevva.com/guides/free-3d-model-sites) (secondary)
- **Kenney**: all assets are public domain (CC0) and usable commercially. The 3D line includes cute low-poly characters and a universal animation library. — [Kenney Support](https://kenney.nl/support); [Cinevva](https://app.cinevva.com/guides/free-3d-model-sites)
- **Mixamo**: free, and both characters and animations are royalty-free for personal, commercial and non-profit projects, including video games. No credit is required. You may **not** redistribute the raw character or animation files as a product (engine templates, asset packages, stock or asset-store uploads). Assets should be integrated into the game rather than shipped as easily extractable files. — [Adobe Community: Mixamo FAQ / licensing](https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400); [Adobe Community: the license to use Mixamo](https://community.adobe.com/t5/mixamo-discussions/the-license-to-use-mixamo/m-p/13228937); official page (fetch blocked): [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)
- **Synty** (paid) has two license types: a Standard Subscription (SyntyPass) and a One-Time Purchase. Under the subscription you are "licensed for development using any available assets while your subscription plan is active". The monthly plan has a 3-month prepaid minimum. Edits you make to Synty assets "form part of their intellectual property". Distributing assets to users of UGC platforms (Roblox, Second Life, VRChat) requires a custom license. — [Synty licences overview](https://syntystore.com/pages/licences-overview); [Standard Subscription Licence](https://syntystore.com/pages/standard-subscription-licence); [One-Time Purchase Licence](https://syntystore.com/pages/one-time-purchase-licence); [SyntyPass](https://syntystore.com/products/syntypass)
- **Animation Rigging** (Unity package) is runtime rigging: a library of constraints for procedural motion on top of keyframed or mocap animation. Uses include foot placement on uneven ground, hands on surfaces, aiming, and secondary motion on tails, armor and accessories. — [Animation Rigging manual](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.1/manual/index.html); [Unity: Procedural poses and motion with Animation Rigging](https://unity.com/resources/procedural-poses-motion-animation-rigging)
- Unity Learn has a course, "Prototyping a procedural animated boss", with a Damped Transform lesson (secondary motion). — [Unity Learn](https://learn.unity.com/course/prototyping-a-procedural-animated-boss/tutorial/using-animation-rigging-damped-transform)
- Community example: UnitySpringIK is a three-bone IK constraint for digitigrade (for example frog or creature) legs, built as a custom Animation Rigging constraint. It runs as a Burst-compiled animation job and writes only rotation deltas, so it layers over existing animation. It requires Unity 6000.0.23f1+. — [GitHub: Garegni/UnitySpringIK](https://github.com/Garegni/UnitySpringIK) (license not checked)
- Spring-bone secondary motion options:
  - UniVRM's VRMSpringBone simulates hair and accessory jiggle. — [vrm.dev: VRMSpringBone](https://vrm.dev/en/univrm/springbone/univrm_secondary/)
  - Magica Cloth 2 (paid) offers BoneSpring for small swings and BoneCloth for bone-driven hair and cloth. — [Magica Soft: Bone Spring](https://magicasoft.jp/en/magica-cloth-bone-spring-2/); [Bone Cloth](https://magicasoft.jp/en/magica-cloth-bone-cloth-2/)
  - Dynamic Bone does spring bones only, while Magica does both spring bones and cloth. — [CC/iC Blender Tools docs](https://soupday.github.io/cc_blender_tools/spring-bones.html)
- Feel (see Q3) ships "SquashAndStretch" and "Squash & Stretch Spring" feedbacks. — [Feel](https://feel.moremountains.com/)

### Inferences
- **Recommended character pipeline:**
  1. Design 2-4 hero body types (bean, frog, blob creature) as simple, low-poly, smooth-shaded meshes with big eyes as separate meshes or texture swaps. Simple forms read well at party-game camera distances and suit toon shading.
  2. Model them in Blender, either by hand or with Blender Python scripts an AI can write. Rig them with a minimal skeleton (root, spine, head, 2 arms, 2 legs, optional tail) mapped to Unity Humanoid so CC0 and Mixamo clips retarget.
  3. Use Quaternius UAL / KayKit (CC0) as the base clip library: idle, run, jump, fall, climb, emotes.
  4. Layer on procedural motion: Animation Rigging IK for feet and hands (grabbing, carrying, being chained together), Damped Transform or spring bones for ears, antennae, hats and cosmetics, and code-driven squash and stretch on jump, land and hit.
- Humanoid retargeting to extreme proportions (very short limbs, no neck) tends to look off. Bean and frog bodies may need more procedural and tween animation and fewer mocap-style clips. Fall Guys-style "ragdoll + simple clips" fits the genre and is largely code-driven.
- A purely procedural character (primitives plus shader) is possible for blob or bean shapes and is fully AI-producible. Custom Blender meshes will still look more premium for the shop-cosmetics economy, since hats and skins need fixed attach points.
- The cosmetic skin shop favors CC0 or self-made assets. Synty's "edits become Synty IP" clause and the subscription-dependency wording add risk for a monetized cosmetics catalog.
- Cinemachine plus Timeline suit door-reveal and floor-clear cinematics. Timeline assets and tracks can be built from editor scripts (see Q6).

### Gaps
- Could not fetch Adobe's official Mixamo FAQ (403), so the Mixamo terms come from Adobe Community posts that quote Adobe staff and the FAQ.
- The Synty subscription page did not clearly say whether a game shipped during an active subscription stays licensed after cancelling. Needs a direct read of the full EULA.
- License of UniVRM (commonly reported as MIT) and of UnitySpringIK not verified this session.
- No sourced comparison of Mixamo vs CC0 animation quality for non-human proportions.
- Unity Timeline and Cinemachine 3 cinematic workflows were not researched in depth.
- No sourced info on AI 3D-model generators (text/image-to-3D) and their licenses for commercial games.

## Q3. VFX (VFX Graph vs Particle System) and juice (hitstop, shake, tweens, Feel)

### Takeaway
Use the Particle System (Shuriken) as the default for gameplay VFX and VFX Graph for hero moments. VFX Graph needs compute shaders and is still officially "not out of preview for URP", with a limited platform list. For juice, use PrimeTween (allocation-free, code-first tweens, shake and punch), optionally Feel (paid, 150+ feedbacks including Freeze Frame hitstop, Cinemachine Impulse and squash and stretch), and Cinemachine 3 Impulse for camera shake.

### Cited Findings
- VFX Graph needs compute shaders and SSBOs. Docs for version 17.5: "The Visual Effect Graph isn't out of preview for URP, which means it only supports some of the platforms that URP supports." In URP it does not support gamma color space, and it does not support OpenGL ES. On HDRP it supports every HDRP platform. — [VFX Graph 17.5 Requirements and compatibility](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.5/manual/System-Requirements.html)
- VFX Graph simulates on the GPU and can drive hundreds of thousands to millions of particles, versus the few thousand practical for Shuriken. It is URP/HDRP only, not Built-in. Older devices may lack compute support. — [UhiyamaLab VFX Graph guide](https://uhiyama-lab.com/en/notes/unity/unity-vfx-graph-guide/) (secondary)
- Unity 6 VFX Graph added profiling tools, six-way lighting for smoke, and new Learning Templates. Unity published a Unity 6 VFX Graph e-book. — [Unity blog: Unity 6 VFX Graph e-book](https://unity.com/blog/unity-6-vfx-graph-ebook)
- VFX Graph can use Shader Graph shaders for particle output. — [VFX Graph 17.0: Working with Shader Graph](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/sg-working-with.html)
- On Android, VFX Graph needs Vulkan rather than OpenGL ES. — [Unity Discussions: VFX Graph (URP) mobile](https://discussions.unity.com/t/visual-effect-graph-urp-compatibility-and-performance-on-mobile/935454)
- **PrimeTween**: a high-performance, allocation-free tween library with camera shake and punch, Sequences, inspector-tweakable TweenSettings and custom tween types. Installs from the Asset Store (with demo) or via UPM scoped npm registry. Generic TweenSettings serialization needs Unity 2020.1+. — [GitHub: KyryloKuzyk/PrimeTween](https://github.com/KyryloKuzyk/PrimeTween)
- PrimeTween never allocates GC memory, while DOTween allocates on each tween or delay start. Guidance: PrimeTween for new projects focused on performance, DOTween for the most tutorials and its visual Pro editor. — [Omitram tweening guide 2026](https://omitram.com/unity-tweening-guide-dotween-leantween-primetween/) (secondary); [PrimeTween vs DOTween discussion](https://github.com/KyryloKuzyk/PrimeTween/discussions/8)
- **Feel** (More Mountains, paid Asset Store package) has 150+ feedbacks across audio, UI, particles, post-processing, animation and transforms. They include Freeze Frame (timescale hitstop), Camera Shake (duration, amplitude, frequency), a Cinemachine Impulse feedback, SquashAndStretch / Squash & Stretch Spring, and Time Modifier. It supports URP, HDRP, TextMesh Pro and Cinemachine, and its demos use Cinemachine 3 by default. — [Feel](https://feel.moremountains.com/); [Feel releases](https://feel.moremountains.com/feel-releases)
- Tweening libraries (PrimeTween, DOTween) handle code-driven motion, while Feel/MMFeedbacks handle game-feel orchestration. Many projects use both. — [Omitram](https://omitram.com/unity-tweening-guide-dotween-leantween-primetween/) (secondary)

### Inferences
- With 8 players and bots, Shuriken particles on Steam Deck are the low-risk default. Examples: dust puffs, confetti on room clear, sweat drops, hit stars, door-open sparkles. The ParticleSystem module API is fully scriptable, so AI can generate and tune effects in code.
- Reserve VFX Graph for a few "scale reveal" and boss moments, such as a sky-to-space transition with galaxy particle fields. Test it on Steam Deck early because of the URP preview caveat.
- Juice recipes for a party game:
  - Hitstop: freeze `Time.timeScale` for 50-120 ms, or scale only the affected characters' animation speed.
  - Camera shake: Cinemachine Impulse on slams and explosions.
  - Squash and stretch on jump, land and grab.
  - UI pops (scale punch, bounce ease) on score, coins and skin unlocks.
  - Chromatic or vignette pulses on betrayal reveals.
  - Screen-space "floor cleared" stingers.
  All are small, code-only systems, so PrimeTween plus a hand-rolled ~200-line feedback system can replace Feel if budget matters.
- Feel is configured mainly through inspector components. It can be driven from code, but an AI-scripted pipeline may find a small in-house feedback system easier to reason about.

### Gaps
- Feel's current price was not shown on its site (the link goes to the Asset Store). Not verified.
- PrimeTween's license file could not be fetched (404 on raw path), so its license type is not verified. DOTween's free/Pro split and license were not verified this session.
- No verified CC0 or free VFX libraries (for example Unity's own VFX Graph samples, Kenney particle textures) were confirmed with licenses this session.
- No sourced Steam Deck benchmark of VFX Graph under URP.

## Q4. Environment: modular kits, procedural rooms, lighting, and "scale reveal" rendering

### Takeaway
Build the lettered sub-levels from hand-authored modular room prefabs (CC0 kits like KayKit dungeon and Kenney, or custom), assembled by a seeded generator. Use Wave Function Collapse only for local dressing, because it is slow at runtime. In Unity 6 URP, light with baked lightmaps or APV plus a small number of realtime lights. Do scale reveals (Well, Sky, Space) with a floating origin, layered skyboxes, fog and cheap distant geometry, since URP lacks HDRP's camera-relative rendering.

### Cited Findings
- KayKit provides dungeon kits, hex terrain and dozens of themed "Bits" prop packs, mostly free CC0. — [Cinevva](https://app.cinevva.com/guides/free-3d-model-sites) (secondary)
- Wave Function Collapse in Unity assembles 2D and 3D tile-based levels, dioramas and buildings from handcrafted tilesets. Example implementation: oddmax/unity-wave-function-collapse-3d. — [GitHub: oddmax/unity-wave-function-collapse-3d](https://github.com/oddmax/unity-wave-function-collapse-3d); [PVS-Studio article on WFC in Unity](https://pvs-studio.com/en/blog/posts/csharp/1027/)
- The algorithm "is not fast". Demo implementations push processing to worker threads and spread mesh instantiation over multiple frames, yet still show hiccups and noticeable delays. — [PVS-Studio](https://pvs-studio.com/en/blog/posts/csharp/1027/)
- Developers use WFC for grid-based generation from 200+ room prefabs. — [Unity Discussions: WFC for 200+ room prefabs](https://discussions.unity.com/t/wave-function-collapse-for-more-than-200-room-prefabs-for-grid-based-generation/938577)
- URP 17 APV adds lighting scenario blending (for example day/night or "lights out" sabotage states), sky occlusion and disk streaming. — [What's new in URP 17](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/whats-new/urp-whats-new.html)
- GPU Resident Drawer reduces CPU draw cost for large numbers of static objects via automatic GPU instancing, aimed at larger, more detailed worlds. — [Unity Docs: GPU Resident Drawer](https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/in-urp/reduce-draw-calls-urp/reduce-rendering-work-on-cpu/gpu-resident-drawer)
- Camera-relative rendering (HDRP only per docs) avoids z-fighting on far geometry caused by float precision loss at large coordinates. — [HDRP 17 docs](https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.0/manual/Camera-Relative-Rendering.html)
- The floating-origin technique is the general alternative for large or infinite worlds. — [Wikipedia: Floating origin](https://en.wikipedia.org/wiki/Floating_origin)

### Inferences
- **Room generation for "1A, 1B, 1E..." sub-levels:** a seeded, graph-based layout of rooms linked by doors fits better than full WFC. The generator picks from a curated pool of room prefabs tagged by theme, size, puzzle type and gimmick monster, then places props with rules or light WFC inside each room. Fixed seeds let all networked clients generate identical rooms from one number. This fits a multiplayer game and keeps runtime cost predictable.
- Room shells can be generated from code: ProBuilder meshes, or simply snapping modular wall, floor and door prefabs on a grid. Both suit AI-driven, script-based authoring.
- **Lighting:** bake per room-prefab lightmaps, or use APV with scenario blending for lighting-state changes like sabotage blackouts. Keep 1 directional light plus a few realtime point lights per room for Forward+ on Steam Deck.
- **Scale reveals** (Well, Sky, Space, bigger):
  - Build each layer as its own scene or region near the origin, not real astronomical distances.
  - Sell scale with nested skyboxes or background "shell" meshes drawn by a second camera or a far-layer pass.
  - Use atmospheric fog gradients, billboards or impostors for distant megastructures, and slow camera pull-backs with Cinemachine plus a Timeline cinematic.
  - Use a floating origin wherever the player actually travels far.
  These are common techniques, inferred here rather than sourced.

### Gaps
- ProBuilder's runtime and editor scripting API was not verified this session.
- Impostor tooling (for example Amplify Impostors, paid, or open-source impostor bakers) and URP camera stacking were not verified.
- No postmortem sources were found on procedural room generation in comparable party games (PEAK's mountain generation, for example).
- The license of oddmax's WFC repo (and of mxgmn's original WFC, commonly cited as MIT) was not verified.

## Q5. Audio: FMOD / Wwise vs Unity audio; free and CC0 sound sources and licenses

### Takeaway
Built-in Unity audio plus a code-driven sound manager is enough to start and is fully AI-scriptable. FMOD's free Indie tier is the usual upgrade for adaptive music and complex events. Wwise is also free below a budget ceiling. For content, use Kenney audio (CC0), Freesound filtered to CC0 (or CC BY with credits), and the Sonniss #GameAudioGDC bundles (royalty-free, no attribution, but cannot be resold individually).

### Cited Findings
- **FMOD** free Indie tier: available if yearly revenue is under US$200k and the project's development budget is under US$500k. Unlimited titles while under the revenue cap; all features except email support. Some industries are excluded (for example gambling and simulation). — [GameFromScratch](https://gamefromscratch.com/fmod-studio-now-free-for-indie-game-developers/); [Game Developer](https://www.gamedeveloper.com/audio/small-developers-and-creators-can-now-use-fmod-studio-for-free). *Conflict:* another source describes an FMOD "Indie" license for budgets under US$500k as a **one-time US$2k** fee, free only for developers under US$200k revenue. This likely describes two tiers, but I could not confirm it because fmod.com/licensing returned empty. — [Bugnet: FMOD vs Wwise for indie](https://bugnet.io/blog/fmod-vs-wwise-for-indie-games)
- **Wwise**: the Indie license is reportedly free for development budgets under US$250k, with Wwise Pro reportedly about US$7k. — [Bugnet](https://bugnet.io/blog/fmod-vs-wwise-for-indie-games) (secondary). The official [Audiokinetic pricing page](https://www.audiokinetic.com/en/wwise/pricing/) returned 403, so this is unverified against the primary source.
- **Sonniss #GameAudioGDC bundle** license: worldwide, non-exclusive, royalty-free for personal and commercial projects in all media, **no attribution required**, unlimited projects for life. You may modify and use the sounds in your works but may not claim authorship or sell the sounds individually. A GDC 2026 bundle is available. — [Sonniss: The License](https://sonniss.com/gdc-bundle-license/); [Sonniss GameAudioGDC archive](https://sonniss.com/gameaudiogdc/); [GDC 2026 bundle](https://gdc.sonniss.com/)
- **Kenney audio**: for example "UI Audio" (50 assets) and "Digital Audio" (60 assets), free and **CC0**. — [Kenney UI Audio](https://kenney.nl/assets/ui-audio); [Kenney Digital Audio](https://kenney.nl/assets/digital-audio); [Kenney Audio category](https://kenney.nl/assets/category:Audio)
- **Freesound** uses CC0, CC BY and CC BY-NC:
  - CC0: no credit needed.
  - CC BY: credit **must** be given.
  - CC BY-NC: credit required and **no commercial use**.
  A search filter restricts results to "Free Cultural Works" licenses (CC0 and CC BY). — [Freesound FAQ](https://freesound.org/help/faq/)

### Inferences
- For an AI-driven workflow, Unity's built-in AudioSource/AudioMixer plus a scripted sound manager is the most code-friendly option. It covers pooled one-shots, randomized pitch and volume, per-surface footsteps, ducking via mixer snapshots and music layers crossfaded by game state. FMOD Studio projects are authored mainly in a separate GUI, which cuts against "everything via scripts". Adopt FMOD later, for adaptive music (for example intensity rising as a betrayal vote nears) or if a human sound designer joins.
- Keep a machine-readable `audio_licenses.csv` (file, source URL, license, attribution text). Freesound CC BY sounds need credits and CC BY-NC sounds must be excluded from a commercial game.
- Budget thresholds for FMOD and Wwise (US$200k revenue / US$250-500k budget) matter if the game succeeds commercially. Re-check the license before launch.

### Gaps
- Could not load the primary FMOD and Wwise pricing pages, so exact current (2026) thresholds and fees are unverified. The FMOD "free vs US$2k Indie" split and any budget-ceiling change need checking at fmod.com/licensing.
- No sourced CC0 or royalty-free music libraries were identified this session (candidates to check: Kenney music loops, OpenGameArt CC0 music, paid royalty-free libraries).
- Unity 6 audio-system changes (if any) were not researched.

## Q6. What can be produced or wired largely through code or editor scripts (AI-driven development)

### Takeaway
Since mid-2026, Unity officially exposes the Editor to external AI agents through the Unity MCP server (Unity 6+). Open-source MCP servers expose even more, including Shader Graph, animation, terrain and NavMesh. Most of the pipeline is scriptable: rendering settings, prefabs and rooms, lighting bakes, particles, animation controllers and rigs, cameras and cinematics, audio and tweens. The hard-to-script parts are original 3D modeling and hand-keyed animation, and to a lesser degree node-graph assets (Shader Graph, VFX Graph). Those should be replaced by CC0 assets, Blender Python, code-written HLSL shaders and procedural animation.

### Cited Findings
- Unity's official **Unity MCP server** connects agents such as Claude Code, Cursor, Windsurf, Claude Desktop and VS Code Copilot to the Unity Editor. It requires Unity 6 (6000.0)+ with the AI Assistant package. Exposed tools include scene hierarchy, GameObject create/modify, C# script create/edit, console logs and errors, component inspection and value changes, and build settings inspection. Custom MCP tools can be registered in C#. It requires an active trial or subscription to Unity's AI tools. Published May 11, 2026. — [Unity blog: Unity MCP how to get started](https://unity.com/blog/unity-ai-mcp-how-to-get-started); [Unity MCP docs (com.unity.ai.assistant 2.0.0-pre.1)](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.0/manual/unity-mcp-overview.html)
- **Unity AI** entered open beta on May 4, 2026 for Unity 6. It has Ask, Agent and Plan modes, writes C# scripts, generates scenes from images, creates placeholder assets, and includes an AI Gateway for third-party models and an MCP server. Pricing: Personal users get a 14-day trial with 1,000 credits, then US$10/month for 1,000 credits. Pro, Enterprise and Industry seats include credits and MCP access. — [Cinevva news](https://app.cinevva.com/news/2026-05-04-unity-ai-open-beta) (secondary)
- The open-source **AnkleBreaker unity-mcp-server** says it offers 268 tools covering scene management, GameObjects, components, builds, profiling, Shader Graph, Amplify, terrain, physics, NavMesh, animation and MPPM multiplayer testing. This is self-described and unverified. — [GitHub: AnkleBreaker-Studio/unity-mcp-server](https://github.com/anklebreaker-studio/unity-mcp-server)
- Other open-source Unity MCP bridges exist, for example CoderGamester's mcp-unity. — [Bright Coding overview](https://www.blog.brightcoding.dev/2026/09/14/codergamestermcp-unity-ai-agent-control-for-unity-editor-via-mcp); [usmanbutt-dev/unity-mcp](https://github.com/usmanbutt-dev/unity-mcp)
- PrimeTween animations are created in one line of code and are also inspector-serializable. — [PrimeTween GitHub](https://github.com/KyryloKuzyk/PrimeTween)
- Animation Rigging constraints run as C# animation jobs, and custom constraints can be written in code (for example UnitySpringIK's Burst job). — [UnitySpringIK](https://github.com/Garegni/UnitySpringIK); [Animation Rigging manual](https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.1/manual/index.html)
- Quaternius assets ship as .blend source files, which Blender Python scripts can edit. — [Quaternius UAL page](https://quaternius.com/packs/universalanimationlibrary.html)

### Inferences
Scriptability tiers:
- **Fully code/editor-scriptable (AI-friendly):**
  - URP Asset and Renderer settings; Volume profiles (bloom, color grading, SSAO); materials and material variants.
  - Hand-written HLSL toon, outline and water shaders as text files. These are easier for an AI to author and diff than Shader Graph.
  - Prefab and room assembly, seeded procedural levels and lightmap/APV bakes via editor scripts.
  - ParticleSystem effects; Cinemachine cameras and Impulse; Timeline cinematics; AnimatorControllers.
  - Animation Rigging constraints; procedural squash, stretch and spring code; tweens; the audio manager and mixer snapshots; UI.
- **Partially scriptable:**
  - Shader Graph and VFX Graph assets are serialized graph files. Unity's official MCP docs don't list tools for them, though third-party MCP servers claim Shader Graph support. Prefer code shaders, with VFX Graph only for a few hero effects.
- **Hard to script, so substitute:**
  - Original character sculpting, texture painting and keyframe animation. Use CC0 kits and animation libraries (Quaternius, KayKit, Kenney), Mixamo clips, procedural animation, and Blender Python for simple parametric characters and cosmetics.
- **Practical recommendation:**
  - Enable the official Unity MCP server, or an open-source one, so the AI can build scenes, prefabs and configs directly.
  - Keep art source-of-truth in text where possible: shaders in HLSL, level specs and room tags in JSON or ScriptableObjects, feedback recipes in code.
  - Add editor-script validators, such as missing-license checks and poly-budget checks.

### Gaps
- Unity's AI terms on ownership and commercial use of AI-generated assets (Unity AI Generators) were not found. The Cinevva article says nothing on it.
- The exact tool list of the official Unity MCP server beyond the blog's examples (for example Shader Graph, Animator or asset import tools) was not verified. The AnkleBreaker 268-tool claim is self-reported.
- Unity editor APIs for programmatically creating AnimatorControllers, Timeline assets, ProBuilder meshes and Shader Graph files were not checked against current Unity 6 docs this session.

## Fact-check (independent)

Independent re-check, 2026-09-28, of the 19 claims the recommendations lean on most. Checked with fresh web searches and fetches. Pages that still refused automated fetches (403 or empty): fmod.com/licensing, audiokinetic.com pricing and blog, helpx.adobe.com Mixamo FAQ.

### CONFIRMED
1. **PEAK**: built in Unity; made by Aggro Crab + Landfall; released 16 June 2025; 2 million copies by day 9; up to 4 players; started as a month-long jam in February 2025 at an Airbnb in Hongdae, Seoul. It became Steam Deck Verified in August 2025 with patch 1.25.a. It was not Verified at launch. — [Wikipedia](https://en.wikipedia.org/wiki/Peak_(video_game)); [PC Gamer](https://www.pcgamer.com/games/sim/peak-devs-say-the-hit-comedy-climber-was-pitched-in-a-swedish-hot-tub-and-developed-in-a-frantic-4-week-korean-game-jam-we-brought-our-computers-to-an-airbnb-in-hongdae-and-locked-tf-in-for-a-month/); [Pocket Tactics](https://www.pockettactics.com/peak/steam-deck-verified)
2. **Cult of the Lamb** is built in Unity (Massive Monster, 2022). — [Wikipedia](https://en.wikipedia.org/wiki/Cult_of_the_Lamb)
3. **URP 17 feature set**, all confirmed on the URP 17 "What's new" page:
   - APV with Lighting Scenario Blending, sky occlusion and disk streaming.
   - GPU Resident Drawer.
   - STP, enabled at URP Asset > Quality > Upscaling Filter.
   - Render Graph and the Render Graph Viewer.
   — [What's new in URP 17](https://docs.unity3d.com/6000.0/Documentation/Manual/urp/whats-new/urp-whats-new.html)
4. **GPU Resident Drawer uses BatchRendererGroup and GPU instancing.** Confirmed, but the notes leave out important limits:
   - Only works with Forward+ or Deferred+ renderers.
   - Needs compute shaders. OpenGL ES and visionOS are not supported.
   - Realtime GI with Enlighten must be off.
   - Objects cannot have more than 128 materials.
   - **Objects with an Animation or Animator component in their hierarchy are excluded.** It helps static room geometry, not the animated characters.
   — [Unity Docs: GPU Resident Drawer](https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/in-urp/reduce-draw-calls-urp/reduce-rendering-work-on-cpu/gpu-resident-drawer)
5. **Camera-relative rendering is HDRP-only.** HDRP docs up to 17.0 cover it, and Unity forum threads still request it for URP. No URP docs page exists. — [HDRP 17 docs](https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.0/manual/Camera-Relative-Rendering.html); [Unity Discussions](https://discussions.unity.com/t/urp-camera-relative-rendering-when/921267)
6. **VFX Graph 17.5 limits**, matching the docs word for word:
   - "isn't out of preview for URP".
   - No gamma color space in URP.
   - No OpenGL ES.
   - Needs compute shaders and SSBOs.
   — [VFX Graph 17.5 requirements](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.5/manual/System-Requirements.html)
7. **Unity Toon Shader licensing**: source code is under the Unity Companion License and Unity-chan assets under the Unity-Chan License. It supports the Built-in pipeline, URP and HDRP. — [GitHub](https://github.com/unity-technologies/com.unity.toonshader)
8. **Quaternius UAL**: "120+ Animations", CC0, formats FBX, GLB and .blend. — [Quaternius](https://quaternius.com/packs/universalanimationlibrary.html)
9. **Kenney**: all assets are CC0 and free for commercial use. Attribution is optional, but Kenney's logo may not be used. — [Kenney Support](https://kenney.nl/support)
10. **Mixamo**: royalty-free for commercial games with no extra purchase. Raw character and animation files may not be redistributed (asset packs, templates, stock sites, or free distribution). This was confirmed through a search-indexed copy of the official helpx FAQ, since direct fetch returned 403. — [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)
11. **Synty subscription terms**:
    - The 3-month prepaid minimum applies to the monthly plan: US$40/mo monthly, or US$30/mo billed annually.
    - The licence text says edits to Synty assets "form part of Our Materials and are our Intellectual Property".
    - This also fills the Q2 gap on cancelling: after termination you "must cease using our Assets in any new Intellectual Property created following the date of termination", while bug-fix maintenance of existing products is allowed.
    — [SyntyPass](https://syntystore.com/products/syntypass); [Standard Subscription Licence](https://syntystore.com/pages/standard-subscription-licence)
12. **Feel**: "more than 150 feedbacks", including Freeze Frame, Cinemachine Impulse and Squash and Stretch, with URP and HDRP feedbacks. — [Feel](https://feel.moremountains.com/)
13. **PrimeTween**:
    - Allocation-free ("No runtime memory allocations, ever").
    - Installs from the Asset Store or via UPM scoped registry `com.kyrylokuzyk.primetween`.
    - TweenSettings generic serialization needs Unity 2020.1+.
    — [GitHub](https://github.com/KyryloKuzyk/PrimeTween)
14. **Sonniss GDC bundle**: royalty-free, commercial use, no attribution; you may not sell or redistribute the sounds as sound effects or claim authorship. **One term is missing from the notes:** the license bans using the sounds "for the purpose of training artificial intelligence technologies" without written permission. — [Sonniss license](https://sonniss.com/gdc-bundle-license/)
15. **Unity MCP server**:
    - Published 11 May 2026.
    - Needs Unity 6 (6000.0)+ with the AI Assistant package.
    - Clients: Claude Code, Cursor, Windsurf, Claude Desktop, VS Code Copilot.
    - Tools cover the scene, scripts, console, components and build settings.
    - The docs page is for com.unity.ai.assistant 2.0.0-pre.1.
    — [Unity blog](https://unity.com/blog/unity-ai-mcp-how-to-get-started); [Unity MCP docs](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.0/manual/unity-mcp-overview.html)
16. **Unity AI pricing**: Personal users get a one-time 1,000-credit trial to use within 14 days, then US$10/month for 1,000 credits. Pro, Enterprise and Industry seats include access. Primary source now found. The open-beta date of 4 May 2026 is confirmed only by secondary sources. — [unity.com/features/ai](https://unity.com/features/ai); [Cinevva](https://app.cinevva.com/news/2026-05-04-unity-ai-open-beta)

### CORRECTED
17. **Unity MCP access (Q6).** The notes say it "requires an active trial or subscription to Unity's AI tools". The current official AI features page FAQ says: "MCP server is free, with no concurrency limits", it "will not consume Unity credits", and the AI Gateway is also credit-free. The remaining requirements are Unity 6.0+ and linking the project to Unity Cloud. The 11 May blog wording looks out of date. — [unity.com/features/ai](https://unity.com/features/ai)
18. **KayKit Character Animations count (Q2).** The notes say 133 animations. The itch.io page now lists **161 humanoid animations (150+ in the free version)** across Rig_Medium and Rig_Large. It is still CC0. The author asks people not to resell unmodified copies. A $14.99+ SOURCE tier adds the .blend files. — [itch.io](https://kaylousberg.itch.io/kaykit-character-animations)
19. **Quaternius .blend files (Q6).** The notes say "Quaternius assets ship as .blend source files". The .blend source files are only in the paid **Source** tier (bought, or via Patreon Source keys). The free Standard tier is about 60-70% of the pack and ships as OBJ, FBX and glTF. — [Quaternius](https://quaternius.com/packs/universalanimationlibrary.html)
20. **Synty and UGC platforms (Q2).** The notes say "UGC platforms (Roblox, Second Life, VRChat) require a custom license". The SyntyPass page says the Standard Subscription "Covers individual UGC in Content Creation Systems e.g. Roblox games". The custom licence is for generative AI, printing, reselling and agency work. **Not in the notes and important for this team:** the One-Time Purchase EULA bans use in "Generative AI programs and datasets" and in "Metaverse-related and/or Game Creation Software". — [SyntyPass](https://syntystore.com/products/syntypass); [One-Time Purchase Licence](https://syntystore.com/pages/one-time-purchase-licence)
21. **Unity Toon Shader version (Q1).** The newest docs are **0.15.0-preview**, not the 0.11.1-preview example. The main point stands: every release is still labelled "-preview". — [UTS 0.14 changelog](https://docs.unity3d.com/Packages/com.unity.toonshader@0.14/changelog/CHANGELOG.html); [GitHub releases](https://github.com/Unity-Technologies/com.unity.toonshader/releases)
22. **FMOD Indie terms (Q5).**
    - **Revenue cap:** free under US$200k yearly revenue. Confirmed.
    - **Budget cap:** the US$500k figure comes from Dec 2020 articles. Wikipedia now gives the Indie budget cap as **under US$600k**, Basic as US$600k-1.8M and Premium as over US$1.8M. A secondary source prices Basic at US$6k and Premium at US$18k per title (not verified against the primary).
    - **Conditions missing from the notes:** the project must be registered on your fmod.com profile, the game must include **FMOD attribution**, and FMOD may only ship inside a game, not an engine or toolset.
    - **Not re-verified:** the "one-time US$2k" Indie fee.
    — [Wikipedia: FMOD](https://en.wikipedia.org/wiki/FMOD); [GameFromScratch (2020)](https://gamefromscratch.com/fmod-studio-now-free-for-indie-game-developers/); [Techjockey](https://www.techjockey.com/detail/fmod) (secondary)

### UNVERIFIED
23. **Wwise pricing.**
    - The free tier for development budgets under US$250K is confirmed only by search snippets that point at audiokinetic.com pages. Direct fetches returned 403.
    - Pro "about US$7k" conflicts with a secondary source: "starts from $8,000", per platform, budgets up to US$2M. Neither was checked against the primary page.
    — [Audiokinetic pricing (403)](https://www.audiokinetic.com/en/wwise/pricing/for-games/); [Software Finder](https://softwarefinder.com/design-software/wwise) (secondary)
24. **Still unchecked:**
    - Feel's price (the site links to the Asset Store).
    - The AnkleBreaker "268 tools" claim.
    - The HDRP Steam Deck ~30 FPS anecdote (a single forum post).
    - That Feel's demos use Cinemachine 3 by default.
25. **PrimeTween license type.** No longer unknown, but not a standard license. GitHub reports it as "Other/NOASSERTION". It is a custom license from Kyrylo Kuzyk: free and commercial use in shipped binaries is allowed, and redistributing the source in derivative products is restricted unless installed via npm. Read the full LICENSE before shipping. — [GitHub license API](https://api.github.com/repos/KyryloKuzyk/PrimeTween/license)
