import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const config = {
    development: {
        username: process.env.DB_ID,
        password: process.env.DB_PW,
        database: process.env.DB,
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
        timezone: "+09:00",
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        define: {
            timestamps: true,
        },
    },
    test: {
        username: process.env.DB_ID,
        password: process.env.DB_PW,
        database: process.env.DB,
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
        timezone: "+09:00",
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        define: {
            timestamps: true,
        },
    },
    production: {
        username: process.env.DB_ID,
        password: process.env.DB_PW,
        database: process.env.DB,
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
        timezone: "+09:00",
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        define: {
            timestamps: true,
        },
    },
};

export default config;