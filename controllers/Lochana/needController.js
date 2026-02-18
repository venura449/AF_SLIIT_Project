const Needs = require('../../models/Lochana/Needs.js');
const needService = require('../../services/Lochana/needService.js');

exports.createNeed = async (req, res)=>{
    try{
        const need = await needService.createNeedRequest({
            ...req.body,
            recipient: req.user ? req.user.id : req.body.recipient
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

exports.updateNeedsProgress = async (req,res)=>{
    try{
        const {needId} = req.params;
        //for dubugging
        // console.log("Body received in controller:", req.body)
        const {amount, status} =req.body;

        const updatedNeed = await needService.updateNeedsStatus(needId, {amount, status});

        res.status(200).json({success:true, data:updatedNeed});

    }catch(err){
        res.status(400).json({success:false, message: err.message});
    }
};

exports.uploadDocs = async (req,res)=>{
    try{
        const {needId} = req.params;

        if(!req.files || req.files.length === 0){
            return res.status(400).json({success:false, message:'No files uploaded'});
        }

        const updatedNeed = await needService.uploadVerificationDocs(needId, req.files);
        res.status(200).json({success:true, data:updatedNeed});
    }catch(err){
        res.status(400).json({success:false, message: err.message});
    }

};

exports.verfyNeedRequest = async (req,res)=>{
    try{
        const {needId} = req.params;

        const verfiedNeed = await Needs.findByIdAndUpdate(
            needId,
            {
                isVerified:true,
                verifiedBy:req.user.id
            },
            {new:true}
        );

        if(!verfiedNeed){
            return res.status(400).json({success:false, message:'Need not found'});
        }

        res.status(200).json({success:true, data:verifiedNeed, message:'Need Request Verified Successfully'});
    }catch(err){
        res.status(400).json({success:false, message:err.message});
    }
};