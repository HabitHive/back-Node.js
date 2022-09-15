import TagRepository from "../repositories/tag.repository.js";
import UserRepository from "../repositories/user.repository.js";

export default new (class TagService {
  result = async (status, message, result) => {
    return { status, message, result };
  };

  buyPage = async (userId) => {
    // 구매한 태그는 찾지 않게 만들기 (O)
    // TagId의 고유 값을 선택한 횟수 관심회 한 태그들의 목록 으로 추천 알고리즘 만들기 (XXX)

    const userInfo = await TagRepository.interest(userId);
    // 관심사 선택을 아무 것도 안했을 경우 #만 넘어온다. if 문으로 잡아라
    const userInterest = userInfo.interest.split("#");
    // 관심사를 #으로 자르고 배열로 만든다.

    // 잘못 저장 되었던 관심목록에 대한것 중 ( 3개이상의 요소 거나, 없을 때 )
    const categoryList = userInterest.length;

    if (
      categoryList != 2 &&
      categoryList != 3 &&
      categoryList != 4 &&
      categoryList != 5
    ) {
      return {
        status: 400,
        result: userInterest,
        message: "관심 목록 설정이 잘못 되었는데",
      };
    }
    // 포인트 찾아서 보내기 (O)
    const userPoint = userInfo.point;

    // 구매한 태그들
    const BuyLists = await TagRepository.tagBuyList(userId);
    // 산 태그 리스트 목록
    const BuyTagIdList = [];
    for (let i = 0; i < BuyLists.length; i++) {
      BuyLists.map((allList) => {
        BuyTagIdList.push(allList.tag_id);
      });
    }

    const tagLists = await TagRepository.buyPage();
    // 전체 목록 리스트 = > 목록 중에서 구매한 태그는 제거(O)
    const tagListsFilter = tagLists.map((allList) => {
      if (!BuyTagIdList.includes(allList.tag_id)) {
        return {
          tagId: allList.tag_id,
          tagName: allList.tag_name,
          category: allList.category.split("#"),
        };
      }
    });
    // 전체 태그 리스트에서 구매한 리스트 부분 배열 null로 만들고 정리
    const tagList = tagListsFilter.filter(function (check) {
      return check !== undefined;
    });

    // 랜덤 요소를 위한 선언
    let randomTagList = [];
    let randomCount = [];

    //관심목록을 설정을 안했을 경우 (O)
    if (categoryList != 2) {
      const recommendedList = await TagRepository.recommended(
        categoryList,
        userInterest
      );
      //관심 목록이 있을때 => 목록 중에서 구매한 태그는 제거(X))

      const number = Math.floor(Math.random() * (categoryList - 2)) + 1;
      let algorithmScores = [];
      if (number == 1) {
        algorithmScores = recommendedList.tagList1.map((allList) => {
          if (!BuyTagIdList.includes(allList.tag_id)) {
            return {
              tagId: allList.tag_id,
              tagName: allList.tag_name,
              category: allList.category.split("#"),
            };
          }
        });
      }
      if (number == 2) {
        algorithmScores = recommendedList.tagList2.map((allList) => {
          if (!BuyTagIdList.includes(allList.tag_id)) {
            return {
              tagId: allList.tag_id,
              tagName: allList.tag_name,
              category: allList.category.split("#"),
            };
          }
        });
      }
      if (number == 3) {
        algorithmScores = recommendedList.tagList3.map((allList) => {
          if (!BuyTagIdList.includes(allList.tag_id)) {
            return {
              tagId: allList.tag_id,
              tagName: allList.tag_name,
              category: allList.category.split("#"),
            };
          }
        });
      }
      const algorithmScore = algorithmScores.filter(function (check) {
        return check !== undefined;
      });

      // 태그가 수가 부족하면 무한 로딩에 걸릴 수있다...
      // 카테고리로 찾는 경우에는 특정 카테고리에 대해서 다 사고 찾을 때 개수가 3개보다 부족할 수 있다.
      var count = 0;
      // 관심 목록의 수가 부족할 때 반복 횟수를 제한하는 용도

      while (randomTagList.length != 3 && count != 30) {
        let randomNum = Math.floor(Math.random() * algorithmScore.length);
        if (!randomCount.includes(randomNum)) {
          randomTagList.push(algorithmScore[randomNum]);
          randomCount.push(randomNum);
        }
        count += 1;
      }
      if (tagList.length < 3) {
        return {
          status: 400,
          result: { randomTagList, tagList, userPoint },
          message: "태그의 수가 부족해서 randomTagList의 수가 작다",
        };
      }
      while (randomTagList.length != 3) {
        let randomNum = Math.floor(Math.random() * tagList.length);
        if (!randomCount.includes(randomNum)) {
          randomTagList.push(tagList[randomNum]);
          randomCount.push(randomNum);
        }
      }
    } else {
      // 관심사 없을 때
      while (randomTagList.length != 3 && count != 30) {
        let randomNum = Math.floor(Math.random() * tagList.length);
        if (!randomCount.includes(randomNum)) {
          randomTagList.push(tagList[randomNum]);
          randomCount.push(randomNum);
        }
        count += 1;
      }
    }

    return {
      status: 200,
      result: { randomTagList, tagList, userPoint },
      message: "습관 목록 불러오기 성공",
    };
  };

  tagBuy = async (userId, tagId, period) => {
    // 같은 태그를 구매하나? 테이블 만들 때 찾으면서 만드느 것 있던 데 (x)
    const userInfo = await TagRepository.interest(userId);
    const fixPoint = period * 10; // 포인트는 어떡게 만들어나...
    const point = userInfo.point - fixPoint;
    if (point < 0) {
      return {
        status: 400,
        result: point,
        message: "보유한 포인트가 부족합니다.",
      };
    }

    const result = await TagRepository.tagBuy(userId, tagId, period, point);

    return { status: 200, result: point, message: "내 습관 추가" };
  };

  monthDone = async (userId, strDate) => {
    const yearMonth = strDate.split("-").pop().join("-");
    const date = new Date(yearMonth + "-1");
    const lastDate = new Date(strDate);

    const history = await UserRepository.colorHistory(userId, yearMonth);

    while (date <= lastDate) {
      let count = 0;
      history.map((h) => {
        if (h.date == date) {
          count++;
        }
      });
    }
  };

  /**
   * 습관을 완료했을 때 호출
   * @param {number} userId 사용자별 유니크 숫자
   * @param {number} scheduleId 일정 유니크 숫자
   * @param {string} strDate 문자열 날짜
   * @returns first : 첫 완료 여부 / bonus : 보너스 여부 / bonusPoint
   */
  done = async (userId, scheduleId, strDate) => {
    /* 일정 정보 불러오기 */
    const schedule = await TagRepository.findSchedule(scheduleId);
    if (!schedule) return this.result(400, "존재하지 않는 일정입니다.");
    else if (schedule.User["user_id"] !== userId)
      return this.result(401, "본인의 일정이 아닙니다.");

    const userTagId = schedule.user_tag_id;
    const tag = await TagRepository.findUserTag(userTagId);
    const date = new Date(strDate);
    const startDate = new Date(tag.start_date);
    const endDate = new Date(tag.end_date);

    if (date < startDate) return this.result(400, "시작되지 않은 일정입니다.");
    else if (date > endDate) return this.result(400, "종료된 일정입니다.");

    const done = await TagRepository.createDone(
      userId,
      userTagId,
      date,
      schedule.time_cycle
    );
    console.log(done);

    const exist = await UserRepository.existHistory(userTagId, date);
    const fisrt = exist ? false : true; // 이미 기록이 존재한다면 포인트 X
    let bonus = false;
    let bonusPoint = 0;

    /* 첫 완료*/
    if (fisrt && date != endDate) {
      const userPoint = await UserRepository.findPoint(userId);
      const increase = await UserRepository.updatePoint(userId, userPoint + 20);
      if (increase == [0]) return this.result(400, "알 수 없는 에러");

      await UserRepository.createHistory(userId, 20, date, userTagId);
    }

    /* 첫 완료 + 마지막 날 */
    if (fisrt && date == endDate) {
      const count = await UserRepository.countHistory(userTagId);
      bonus = count == tag.period; // 일정 내내 성공했다면 보너스 true
      if (bonus) {
        bonusPoint = tag.period * 20;
      }

      const userPoint = await UserRepository.findPoint(userId);
      const increase = await UserRepository.updatePoint(
        userId,
        userPoint + 20 + bonusPoint
      );
      if (increase == [0]) return this.result(400, "알 수 없는 에러");

      const updateTag = await TagRepository.isSuccess(userTagId, bonus);
      if (updateTag == [0]) return this.result(400, "알 수 없는 에러");
    }

    return this.result(201, "습관 완료", { first, bonus, bonusPoint });
  };
})();
