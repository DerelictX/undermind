export const compound_tier: [
    MineralBaseCompoundsConstant[],
    tier1_comp<base>[],
    tier2_comp<tier1_comp<base>>[],
    tier3_comp<tier2_comp<tier1_comp<base>>>[]
] = [
    [
        'G', 'ZK', 'UL', 'OH'
    ], [
        'ZO', 'GO', 'LO',
        'KO', 'UH',
        'LH', 'ZH', 'GH',
        'KH', 'UO'
    ], [
        'ZHO2', 'GHO2', 'LHO2',
        'KHO2', 'UH2O',
        'LH2O', 'ZH2O', 'GH2O',
        'KH2O', 'UHO2'
    ], [
        'XZHO2', 'XGHO2', 'XLHO2',
        'XKHO2', 'XUH2O',
        'XLH2O', 'XZH2O', 'XGH2O',
        'XKH2O', 'XUHO2'
    ]
]

export const reaction_line: {
    [R in tier1_comp<base>]: [R, tier2_comp<R>, tier3_t1<R>]
} = {
    UH: ["UH", "UH2O", "XUH2O"],
    ZH: ["ZH", "ZH2O", "XZH2O"],
    KH: ["KH", "KH2O", "XKH2O"],
    LH: ["LH", "LH2O", "XLH2O"],
    GH: ["GH", "GH2O", "XGH2O"],
    UO: ["UO", "UHO2", "XUHO2"],
    ZO: ["ZO", "ZHO2", "XZHO2"],
    KO: ["KO", "KHO2", "XKHO2"],
    LO: ["LO", "LHO2", "XLHO2"],
    GO: ["GO", "GHO2", "XGHO2"],
}

export const compressed: CommodityConstant[] = [
    'utrium_bar', 'keanium_bar', 'zynthium_bar', 'lemergium_bar',
    'ghodium_melt', 'oxidant', 'reductant', 'purifier', 'battery'
]
export const compression: { [K in 'G' | MineralConstant | 'energy']: CommodityConstant } = {
    L: 'lemergium_bar',
    K: 'keanium_bar',
    U: 'utrium_bar',
    Z: 'zynthium_bar',
    G: 'ghodium_melt',
    O: 'oxidant',
    H: 'reductant',
    X: 'purifier',
    energy: 'battery'
}

export const production_line: { [d in DepositConstant]: CommodityConstant[] } = {
    mist: ['condensate', 'concentrate', 'extract', 'spirit', 'emanation', 'essence'],
    biomass: ['cell', 'phlegm', 'tissue', 'muscle', 'organoid', 'organism'],
    metal: ['alloy', 'tube', 'fixtures', 'frame', 'hydraulics', 'machine'],
    silicon: ['wire', 'switch', 'transistor', 'microchip', 'circuit', 'device']
}

export const deposits: DepositConstant[] = ['metal', 'biomass', 'silicon', 'mist']
export const product_tier: CommodityConstant[][] = [
    ['alloy', 'cell', 'wire', 'condensate'],
    ['tube', 'phlegm', 'switch', 'concentrate'],
    ['fixtures', 'tissue', 'transistor', 'extract'],
    ['frame', 'muscle', 'microchip', 'spirit'],
    ['hydraulics', 'organoid', 'circuit', 'emanation'],
    ['machine', 'organism', 'device', 'essence']
]

export const base_mineral: (MineralConstant | MineralBaseCompoundsConstant)[] = [
    'X', 'OH', 'O', 'H',
    'G', 'UL', 'ZK',
    'Z', 'L', 'U', 'K'
]
export const companion_base: {
    [M in Exclude<MineralConstant | MineralBaseCompoundsConstant, 'X' | 'OH' | 'G'>]
    : [companion_base<M>, typeof REACTIONS[M][companion_base<M>]]
} = {
    ZK: ["UL", "G"],
    UL: ["ZK", "G"],
    H: ["O", "OH"],
    O: ["H", "OH"],
    L: ["U", "UL"],
    K: ["Z", "ZK"],
    U: ["L", "UL"],
    Z: ["K", "ZK"],
}

export const reactions: { [M in MineralCompoundConstant]: (MineralConstant | MineralCompoundConstant)[] } = {
    OH: ["O", "H"],
    ZK: ["Z", "K"],
    UL: ["U", "L"],
    G: ["ZK", "UL"],

    LH: ["L", "H"],
    UH: ["U", "H"],
    ZH: ["Z", "H"],
    KH: ["K", "H"],
    GH: ["G", "H"],

    LO: ["L", "O"],
    UO: ["U", "O"],
    ZO: ["Z", "O"],
    KO: ["K", "O"],
    GO: ["G", "O"],

    LH2O: ["LH", "OH"],
    UH2O: ["UH", "OH"],
    ZH2O: ["ZH", "OH"],
    KH2O: ["KH", "OH"],
    GH2O: ["GH", "OH"],

    LHO2: ["LO", "OH"],
    UHO2: ["UO", "OH"],
    ZHO2: ["ZO", "OH"],
    KHO2: ["KO", "OH"],
    GHO2: ["GO", "OH"],

    XLH2O: ["LH2O", "X"],
    XUH2O: ["UH2O", "X"],
    XZH2O: ["ZH2O", "X"],
    XKH2O: ["KH2O", "X"],
    XGH2O: ["GH2O", "X"],

    XLHO2: ["LHO2", "X"],
    XUHO2: ["UHO2", "X"],
    XZHO2: ["ZHO2", "X"],
    XKHO2: ["KHO2", "X"],
    XGHO2: ["GHO2", "X"],
}