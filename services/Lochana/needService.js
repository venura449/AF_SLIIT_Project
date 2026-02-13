const Need = require('../../models/Lochana/Needs');

exports.createNeedRequest = async (data)=>{
    return await Need.create(data);
}

exports.getFilteredNeeds = async (filters, pagination)=>{
    const {page, limit} = pagination;
    const skip = (page -1)*limit;

    const query = {};

    if(filters.category) query.category = filters.category;
    if(filters.urgency) query.urgency = filters.urgency;
    if(filters.status) query.status = filters.status;
    if(filters.location) query.location = {$regex: filters.location,$options: 'i'};

    const items = await Need.find(query)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit);

    const total = await Need.countDocuments(query);

    return {
        items,
        total,
        page,
        pages: Math.ceil(total/limit)
    };

};

exports.updateDonationProgress = async (needId, amount)=>{
    const need = await Need.findById(needId);
    if(!need) throw new Error('Need not found');

    need.currentAmount += amount;

    if(need.currentAmount >= need.goalAmount){
        need.status = 'Fulfilled';
    }else if(need.currentAmount > 0){
        need.status = 'Partially Funded';
    }

    return await need.save();

}