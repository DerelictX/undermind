const factory_run = function(factory: StructureFactory){
    factory.produce('energy');
}

const productions: {[d in DepositConstant]:CommodityConstant[]} = {
    mist:       ['condensate','concentrate','extract','spirit','emanation','essence'],
    biomass:    ['cell','phlegm','tissue','muscle','organoid','organism'],
    metal:      ['alloy','tube','fixtures','frame','hydraulics','machine'],
    silicon:    ['wire','switch','transistor','microchip','circuit','device']
}