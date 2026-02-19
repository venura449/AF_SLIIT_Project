const{
    countTotUsers,
    countTotFeedbacks,
    countTotNeeds,
} = require('../../services/Heyli/adminDashService.js');

exports.getTotalUsers = async (req, res) => {
    try{
        const totalUsers = await countTotUsers();

        res.status(200).json({totalUsers});
    }catch(e){
        res.status(404).json({error: e.message});
    }
}

exports.getTotalFeedbacks = async (req, res) => {
    try{
        const totalFeedbacks = await countTotFeedbacks();

        res.status(200).json({totalFeedbacks});
    }catch(e){
        res.status(404).json({error: e.message});
    }
}

exports.getTotalNeeds = async (req, res) => {
    try{
        const totalNeeds = await countTotNeeds();

        res.status(200).json({totalNeeds});
    }catch(e){
        res.status(404).json({error: e.message});
    }   
}


