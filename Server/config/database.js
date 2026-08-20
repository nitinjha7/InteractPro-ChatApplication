const prisma = require('./prisma');

const dbConnect = async () => {
    try{
        await prisma.$connect();
        console.log("Database connected");
    }
    catch(error){
        console.log("Database connection error: ", error);
    }
}

module.exports = dbConnect;
