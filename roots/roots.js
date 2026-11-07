// Word roots for Bi 239 (plants, fungi and plant signals).
// Row: [root, meaning, origin, [[term, what the term means when you put the parts together], ...]]
// Append new roots at the end of a group: mastered/review marks are stored by root text.
window.ROOTS = {
  unit: {
    name: "Plants, Fungi & Signals",
    sub: "Ch 29, 30, 31 and 39: land plants, seed plants, fungi, and plant responses to signals.",
    groups: [
      ["Plant life cycles", [
        ["-phyte", "plant", "Greek phyton", [["gametophyte", "the gamete-making plant (haploid)"], ["sporophyte", "the spore-making plant (diploid)"], ["bryophyte", "moss plant: the nonvascular plants"], ["charophyte", "a green alga related to land plants"], ["lycophyte", "\"wolf plant\": club mosses"], ["pterophyte", "\"feather plant\": ferns"]]],
        ["gamet-", "spouse, sex cell", "Greek gametēs, husband", [["gamete", "an egg or sperm"], ["gametangium", "a vessel for gametes: archegonium or antheridium"], ["gametophyte", "the plant that makes gametes"]]],
        ["spor-", "seed, sowing", "Greek spora", [["spore", "a single cell that is \"sown\" to start a new gametophyte"], ["sporangium", "a vessel that makes spores"], ["sporophyll", "a spore-bearing leaf"], ["sporopollenin", "the tough polymer in spore and pollen walls"]]],
        ["-angium", "vessel, container", "Greek angeion", [["sporangium", "spore container"], ["gametangium", "gamete container"], ["zygosporangium", "the tough container where a zygomycete's zygote forms"], ["angiosperm", "a plant whose seeds sit in a vessel (ovary)"]]],
        ["bryo-", "moss", "Greek bryon", [["bryophyte", "mosses, liverworts and hornworts"]]],
        ["haplo-", "single", "Greek haploos", [["haploid", "one set of chromosomes (n)"]]],
        ["diplo-", "double", "Greek diploos", [["diploid", "two sets of chromosomes (2n)"]]],
        ["zyg-", "yoke, joined", "Greek zygon", [["zygote", "the cell formed when two gametes join"], ["zygomycete", "a fungus named for the zygosporangium where mates join"]]],
        ["arche-", "first, origin", "Greek archē", [["archegonium", "\"first offspring\" organ: holds the egg"]]],
        ["anther-", "flowery", "Greek anthos, flower", [["antheridium", "the organ that makes sperm"], ["anther", "the pollen-making tip of a stamen"]]],
        ["-phyll", "leaf", "Greek phyllon", [["sporophyll", "a leaf that bears sporangia"], ["chlorophyll", "\"green leaf\" pigment"], ["microphyll", "a small leaf with a single vein (lycophytes)"], ["megaphyll", "a large leaf with branched veins"]]],
        ["strobil-", "pine cone", "Greek strobilos", [["strobilus", "a cone-like cluster of sporophylls"]]],
        ["sor-", "heap", "Greek sōros", [["sorus", "a heap of sporangia on a fern leaf"]]]
      ]],
      ["Seeds & flowers", [
        ["-sperm", "seed", "Greek sperma", [["gymnosperm", "naked seed"], ["angiosperm", "vessel seed: seed inside an ovary"], ["endosperm", "the food tissue inside the seed"]]],
        ["gymno-", "naked", "Greek gymnos", [["gymnosperm", "a plant with naked seeds on cones"]]],
        ["endo-", "inside", "Greek endon", [["endosperm", "the nourishing tissue inside a seed"], ["endophyte", "a fungus living inside a plant"]]],
        ["hetero-", "different", "Greek heteros", [["heterosporous", "making two different kinds of spores"], ["heterokaryon", "a cell with genetically different nuclei"], ["heterotroph", "an organism that feeds on others (\"other-feeder\")"]]],
        ["homo-", "same", "Greek homos", [["homosporous", "making one kind of spore"]]],
        ["mega-", "large", "Greek megas", [["megaspore", "the large spore that becomes the female gametophyte"], ["megasporangium", "where megaspores form"]]],
        ["micro-", "small", "Greek mikros", [["microspore", "the small spore that becomes pollen"], ["micropyle", "the small gate where the pollen tube enters the ovule"]]],
        ["-pyle", "gate", "Greek pylē", [["micropyle", "the tiny opening in the ovule"]]],
        ["syn-", "together", "Greek syn", [["synergid", "a cell that works together with the egg; one dies as the pollen tube arrives"]]],
        ["-erg", "work", "Greek ergon", [["synergid", "a \"co-worker\" cell beside the egg"]]],
        ["cotyl-", "cup", "Greek kotylē", [["cotyledon", "a seed leaf"], ["monocot", "one seed leaf"], ["eudicot", "\"true\" two seed leaves"]]],
        ["mono-", "one", "Greek monos", [["monocot", "a flowering plant with one cotyledon"]]],
        ["di-", "two", "Greek di-", [["eudicot", "a flowering plant with two cotyledons"], ["dikaryotic", "having two nuclei per cell"]]],
        ["ov-", "egg", "Latin ovum", [["ovule", "the little egg-holder that becomes a seed"], ["ovary", "the part of the carpel that holds the ovules and becomes the fruit"]]]
      ]],
      ["Signals & responses", [
        ["-tropism", "turning", "Greek tropos", [["phototropism", "turning toward light"], ["gravitropism", "turning in response to gravity"], ["thigmotropism", "turning in response to touch"]]],
        ["photo-", "light", "Greek phōs, phōtos", [["phototropism", "growth toward light"], ["photoperiodism", "responding to day and night length"], ["photomorphogenesis", "light shaping plant form"]]],
        ["thigmo-", "touch", "Greek thigma", [["thigmotropism", "growth in response to touch"], ["thigmomorphogenesis", "change of form caused by touch or mechanical stress"]]],
        ["morph-", "form, shape", "Greek morphē", [["photomorphogenesis", "the creation of form by light"], ["thigmomorphogenesis", "the creation of form by touch"]]],
        ["-genesis", "origin, creation", "Greek genesis", [["photomorphogenesis", "light-driven development"]]],
        ["chrom-", "color", "Greek chrōma", [["phytochrome", "\"plant color\": the red/far-red light receptor"]]],
        ["auxe-", "grow, increase", "Greek auxein", [["auxin", "the growth hormone"]]],
        ["cyto-", "cell", "Greek kytos, vessel", [["cytokinin", "the hormone that drives cell division (cytokinesis)"], ["cytokinesis", "division of the cytoplasm"]]],
        ["-kinesis", "movement", "Greek kinēsis", [["cytokinesis", "the cell splitting in two"], ["cytokinin", "named for cytokinesis"]]],
        ["absciss-", "cut off", "Latin abscindere", [["abscission", "the cutting off (falling) of leaves"], ["abscisic acid", "misnamed: it mainly controls dormancy and drought"]]],
        ["etiol-", "pale, blanched", "French étioler", [["etiolation", "pale, spindly growth in the dark"], ["de-etiolation", "greening when light arrives"]]],
        ["circa-", "about", "Latin circa", [["circadian", "about a day"]]],
        ["-dian", "day", "Latin dies", [["circadian", "a cycle of about one day"]]],
        ["vern-", "spring", "Latin vernus", [["vernalization", "a cold treatment that lets a plant flower in spring"]]],
        ["stato-", "standing, stationary", "Greek statos", [["statolith", "a \"standing stone\" that settles with gravity"]]],
        ["-lith", "stone", "Greek lithos", [["statolith", "a dense plastid that senses gravity"]]],
        ["senesc-", "grow old", "Latin senescere", [["senescence", "programmed aging and death of cells or organs"]]]
      ]],
      ["Fungi", [
        ["-mycete", "fungus", "Greek mykēs, mushroom", [["ascomycete", "sac fungus"], ["basidiomycete", "club fungus"], ["zygomycete", "a yoked (zygosporangium) fungus"], ["chytrid", "from chytridion, \"little pot\": the sporangium"]]],
        ["myc-", "fungus", "Greek mykēs", [["mycelium", "the fungal body of hyphae"], ["mycorrhiza", "fungus-root partnership"], ["mycology", "the study of fungi"]]],
        ["rhiz-", "root", "Greek rhiza", [["mycorrhiza", "fungus + root"], ["rhizoid", "a root-like anchoring filament"], ["Rhizopus", "black bread mold"]]],
        ["hyph-", "web", "Greek hyphē", [["hypha", "a single fungal filament"]]],
        ["asc-", "sac, bag", "Greek askos", [["ascus", "the sac where ascospores form"], ["ascocarp", "the fruiting body holding asci"]]],
        ["basidi-", "little pedestal, club", "Greek basis", [["basidium", "the club-shaped spore-making cell"], ["basidiocarp", "the mushroom"]]],
        ["-carp", "fruit", "Greek karpos", [["ascocarp", "an ascomycete fruiting body"], ["basidiocarp", "a basidiomycete fruiting body"], ["carpel", "the flower part that becomes the fruit"]]],
        ["karyo-", "nucleus, kernel", "Greek karyon", [["karyogamy", "fusion of nuclei"], ["dikaryotic", "two nuclei per cell"], ["heterokaryon", "a cell with different nuclei"]]],
        ["plasmo-", "formed substance (cytoplasm)", "Greek plasma", [["plasmogamy", "fusion of cytoplasm"]]],
        ["-gamy", "marriage, fusion", "Greek gamos", [["plasmogamy", "the cytoplasm marries"], ["karyogamy", "the nuclei marry"]]],
        ["coeno-", "common, shared", "Greek koinos", [["coenocytic", "hyphae without cross-walls: many nuclei share one cytoplasm"]]],
        ["sept-", "wall, fence", "Latin saeptum", [["septate", "hyphae divided by cross-walls"], ["septum", "a cross-wall"]]],
        ["haustor-", "drinker", "Latin haurire, to drink", [["haustorium", "a parasitic fungus's hypha that \"drinks\" from host cells"]]],
        ["conidi-", "dust", "Greek konis", [["conidia", "asexual spores, released like dust"]]],
        ["sapro-", "rotten", "Greek sapros", [["saprobe", "a decomposer that feeds on dead matter"]]]
      ]]
    ]
  }
};
