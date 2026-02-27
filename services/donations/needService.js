const Need = require('../../models/donations/Need.js');

const {cloudinary} = require('../../utils/cloudinaryConfig.js');

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

exports.getNeedsByRecipient = async (userId)=>{
    return (await Need.find({recipient: userId})).toSorted({createdAt: -1});
}

exports.updateNeedsStatus = async (needId, updateData)=>{
    const need = await Need.findById(needId);
    if(!need) throw new Error('Need not found');

    if(need.status === 'Fulfilled'){
        throw new Error('Cannot update a fulfilled need');
    }

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
exports.uploadVerificationDocs = async (needId, files)=>{
    console.log('filed inside service', files);
    const need = await Need.findById(needId);

    if(!need) throw new Error('Need not found');

    const filesData = files.map(file=>({
        url:file.path || file.secure_url,
        public_id:file.filename || file.public_id
    }));

    need.verificationDocs.push(...filesData);
    return await need.save();
}


//delete need request

exports.deleteNeedRequest = async (needId, userId)=>{
    const need = await Need.findById(needId);

    if(!need) throw new Error('Need not found');
    //only creator can delete
    if(need.recipient.toString() !== userId.toString()){
        throw new Error('Unauthorized');
    }
    if(need.verificationDocs && need.verificationDocs.length > 0){
        const deletePromises = need.verificationDocs.map(doc =>{
            return cloudinary.uploader.destroy(doc.public_id);
        });
        await Promise.all(deletePromises);
    }
    await Need.findByIdAndDelete(needId);
    return {message: 'Need and associated images deleted successfully'};
};

//update an existing need request
exports.updateNeedRequest = async (needId, updateData, userId)=>{
    const need = await Need.findById(needId);

    if(!need) throw new Error('Need not found');

    //only creator can update
    if(need.recipient.toString() !== userId.toString()){
        throw new Error('You are not authorized to update this need request');
    }

    return await Need.findByIdAndUpdate(needId, updateData, {
        new:true,
        runValidators:true,
    });
};