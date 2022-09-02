import Sequelize from "sequelize";
import { sequelize } from "./sequelize.js";

export default class Pet extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        pet_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        level: Sequelize.INTEGER,
        exp: Sequelize.INTEGER,
      },
      {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: false,
        modelName: "Pet",
        tableName: "pet",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Pet.belongsTo(db.User, {
      foreignKey: { name: "user_id", allowNull: false },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  }
}
