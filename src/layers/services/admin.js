import Tag from "../../models/tag.js";
import translation from "../utils/translation.category.js";

// 태그 생성 메소드... 파일 위치 옮길 예정
export default new (class adminService {
  input = async (req, res) => {
    const { list } = req.body;
    const listSplit = list.split("/");
    let allTags = [];
    listSplit.map((tagInfo) => {
      let categoryArr = tagInfo.split(" ");
      const tagName = splitInfo.shift();
      console.log(tagName, categoryArr);
      const categoryList = translation(categoryArr, 0);
      if (categoryList.length == 0) {
        res.status(400).send("오타남");
      }
      const category = categoryList.join("#");
      allTags.push({ tag_name: tagName, category });
    });

    await Tag.bulkCreate(allTags);
    res.status(201).send("완료");
  };
})();
