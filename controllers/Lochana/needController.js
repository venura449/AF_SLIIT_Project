const needService = require('../../services/Lochana/needService');

exports.createNeed = async (req, res)=>{
    try{
        const need = await needService.createNeedRequest({
            ...req.body,
            recipient: req.user.id
        });
        res.status(201).json({success:true,data:need});
    }catch(err){
        res.status(400).json({success:false,message:err.message});
    }
};

exports.getAllNeeds = async (req, res)=>{
    try{
        const filters = {
            category: req.query.category,
            urgency: req.query.urgency,
            location: req.query.location,
            status: req.query.status
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await needService.getFilteredNeeds(filters, pagination);
        res.status(200).json({success:true, ...result});
    }catch(err){
        res.status(500).json({success:false, error:err.message});
    }
};