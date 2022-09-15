import UserTag from "../../models/usertag.js";
import Tag from "../../models/tag.js";
import Schedule from "../../models/schedule.js";
import { Op } from "sequelize";
import User from "../../models/user.js";
import Done from "../../models/done.js";

export default new (class TagRepository {
  userInterest = async (user_id) => {
    return await User.findOne({
      attributes: ["interest", "point"],
      where: { user_id },
    });
  };

  userBuyList = async (user_id) => {
    return await UserTag.findAll({
      attributes: ["tag_id"],
      where: { user_id },
    });
  };

  tagAllList = async () => {
    return await Tag.findAll();
  };

  recommended = async (categoryList, userInterest) => {
    // if (categoryList == 2) {
    // } // 관심사 없을 때
    // if (categoryList == 3) {
    //   const tagList1 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[1]}%` } },
    //   });
    //   return { tagList1 };
    // }
    // if (categoryList == 4) {
    //   const tagList1 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[1]}%` } },
    //   });
    //   const tagList2 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[2]}%` } },
    //   });
    //   return { tagList1, tagList2 };
    // }
    // if (categoryList == 5) {
    //   const tagList1 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[1]}%` } },
    //   });
    //   const tagList2 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[2]}%` } },
    //   });
    //   const tagList3 = await Tag.findAll({
    //     where: { category: { [Op.like]: `%${userInterest[3]}%` } },
    //   });
    //   return { tagList1, tagList2, tagList3 };
    // }
    // =====================================================
    let tagList = [];
    for (let i = 1; i <= categoryList; i++) {
      const list = await Tag.findAll({
        where: { category: { [Op.like]: `%${userInterest[i]}%` } },
      });
      tagList.push(list);
    }
    return tagList;
  };

  tagBuy = async (user_id, tag_id, period, point) => {
    await UserTag.create({ user_id, tag_id, period });
    await User.update({ point }, { where: { user_id } });
  };

  myAllTagList = async (user_id) => {
    const myTags = await UserTag.findAll({
      where: { user_id },
      order: [["end_date", "DESC"]],
      include: [{ model: Tag, attributes: ["tag_name"] }],
    });
    return myTags;
  };

  findUserTag = async (user_tag_id) => {
    const tag = await UserTag.findOne({ where: { user_tag_id } });
    return tag;
  };

  schedule = async (user_tag_id) => {
    const scheduleList = await Schedule.findAll({ where: { user_tag_id } });
    return scheduleList;
  };

  dailyPage = async (user_id, todayDate) => {
    const myDailyPage = await UserTag.findAll({
      where: { user_id },
      include: [
        {
          model: Tag,
          attributes: ["tag_name"],
        },
        {
          model: Schedule,
          attributes: ["time_cycle", "week_cycle"],
        },
      ],
    });
    return myDailyPage;
  };

  tagList = async (user_id) => {
    const myTagList = await UserTag.findAll({
      where: { user_id },
      include: {
        model: Tag,
        attributes: ["tag_name"],
      },
    });
    return myTagList;
  };

  schedulePage = async (user_id, user_tag_id) => {
    const tag = await UserTag.findOne({
      where: { user_id, user_tag_id },
    });
    return tag;
  };

  userTagInOf = async (user_id, user_tag_id) => {
    const userTag = await UserTag.findOne({
      where: { user_id, user_tag_id },
    });
    return userTag;
  };

  scheduleDate = async (user_tag_id, start_date, end_date) => {
    await UserTag.update({ start_date, end_date }, { where: { user_tag_id } });
  };

  schedule = async (user_id, user_tag_id, time_cycle, week_cycle) => {
    await Schedule.craete({ user_tag_id, time_cycle, week_cycle });
  };

  findSchedule = async (schedule_id) => {
    const schedule = await Schedule.findOne({
      where: { schedule_id },
      include: [{ model: UserTag, attributes: ["user_id"] }],
    });
    return schedule;
  };

  isSuccess = async (user_tag_id, success) => {
    const result = await UserTag.update(
      { success },
      { where: { user_tag_id } }
    );
    return result;
  };

  createDone = async (user_id, user_tag_id, date, time_cycle) => {
    const result = await Done.create({
      user_id,
      user_tag_id,
      date,
      time_cycle,
    });
    return result;
  };

  // 임시 태그 생성 메소드
  input = async (req, res) => {
    const { tag_name, category } = req.body;
    await Tag.create({ tag_name, category });
    res.send("완료");
  };
})();
