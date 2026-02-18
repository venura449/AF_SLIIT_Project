const Need = require('../../models/Lochana/Needs.js');

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

exports.updateNeedsStatus = async (needId, updateData)=>{
    const need = await Need.findById(needId);
    if(!need) throw new Error('Need not found');

    if(updateData.amount){
        need.currentAmount += Number(updateData.amount);
    }

    if(need.currentAmount >= need.goalAmount){
        need.status = 'Fulfilled';
    }else if(need.currentAmount > 0){
        need.status = 'Partially Funded';
    }

    //manual status update if provided
    if(updateData.status){
        need.status = updateData.status;
    }

    return await need.save();
};


//verification logic for NEED REQUESTS
exports.uploadVerificationDocs = async (needID, files)=>{
    const need = await Need.findById(needID);

    if(!need) throw new Error('Need not found');

    const filesData = files.map(files=>({
        url:files.path,
        public_id:files.fileName
    }));

    need.verificationDocs.push(...filesData);
    return await need.save();
}