// ==UserScript==
// @name         FUT 21 Rarity Search Fix
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @updateURL    https://github.com/chithakumar13/Fifa-RarityFix/blob/master/rarityfix.js
// @description  FIFA 21 Rarity Fix
// @author       CK Algos
// @match        https://www.ea.com/*/fifa/ultimate-team/web-app/*
// @match        https://www.ea.com/fifa/ultimate-team/web-app/*
// ==/UserScript==

(function () {
  "use strict";

  setTimeout(function () {
    accessobjects.Item.searchTransferMarket = function (searchCriteria) {
      var self = this,
        observable = new EAObservable(),
        httpReq = new UTHttpRequest(this["authDelegate"]),
        criteria = {};
      (criteria.num = searchCriteria.count),
        (criteria.start = searchCriteria.offset),
        (criteria.type =
          searchCriteria.type === SearchType.ANY
            ? SearchType.PLAYER
            : searchCriteria.type);
      var formedCriteria = criteria;
      this["id"].request(httpReq);
      if (searchCriteria.defId.length > 0) {
        var _0x129d5e = searchCriteria.defId[0];
        searchCriteria.type === SearchType.PLAYER
          ? (formedCriteria.definitionId = _0x129d5e)
          : (formedCriteria.definitionId =
              _0x129d5e & (ItemIdMask.DATABASE | ItemIdMask.REVISION));
      } else {
        if (searchCriteria.maskedDefId > 0)
          formedCriteria.maskedDefId =
            searchCriteria.maskedDefId & ItemIdMask.DATABASE;
        else
          searchCriteria.category !== SearchCategory.ANY &&
            (formedCriteria.cat = searchCriteria.category);
      }
      if (searchCriteria.zone !== -1)
        switch (searchCriteria.zone) {
          case ZONE_DEFENDER_VALUE:
            formedCriteria.zone = "defense";
            break;
          case ZONE_MIDFIELDER_VALUE:
            formedCriteria.zone = "midfield";
            break;
          case ZONE_ATTACKER_VALUE:
            formedCriteria.zone = "attacker";
            break;
          default:
            DebugUtils.Assert(![], "Unsupported zone ID in market search.");
            break;
        }
      else
        searchCriteria.position !== SearchType.ANY &&
          (formedCriteria.pos = searchCriteria.position);
      if (searchCriteria.rarities.length > 0)
        formedCriteria.rarityIds = searchCriteria.rarities;

      if (searchCriteria.level === enums.SearchLevel.SPECIAL)
        formedCriteria.rare = searchCriteria.level;
      else
        searchCriteria.level !== enums.SearchLevel.ANY &&
          (formedCriteria.lev = searchCriteria.level);

      return (
        searchCriteria.nation > 0 &&
          (formedCriteria.nat = searchCriteria.nation),
        searchCriteria.league > 0 &&
          (searchCriteria.category === SearchCategory.MANAGER_LEAGUE
            ? (formedCriteria.amount = searchCriteria.league)
            : (formedCriteria.leag = searchCriteria.league)),
        searchCriteria.club > 0 && (formedCriteria.team = searchCriteria.club),
        searchCriteria.playStyle > 0 &&
          (formedCriteria.playStyle = searchCriteria.playStyle),
        searchCriteria.minBid && (formedCriteria.micr = searchCriteria.minBid),
        searchCriteria.maxBid && (formedCriteria.macr = searchCriteria.maxBid),
        searchCriteria.minBuy > 0 &&
          (formedCriteria.minb = searchCriteria.minBuy),
        searchCriteria.maxBuy > 0 &&
          (formedCriteria.maxb = searchCriteria.maxBuy),
        httpReq.setPath("/ut/game/" + GAME_NAME + "/transfermarket"),
        httpReq.setRequestType(HttpRequestMethod.GET),
        httpReq.setUrlVariables(formedCriteria),
        httpReq.setCache(![]),
        httpReq.observe(this, function (cb, response) {
          cb.unobserve(self);
          var responseDTO = new UTHttpResponseDTO();
          self["id"].response(cb),
            JSUtils.assignPropertyValues(response, responseDTO);
          if (response.success && JSUtils.isObject(response.response)) {
            var responseVM = {};
            (responseVM.items = factories.Item["generateItemsFromAuctionData"](
              response.response.auctionInfo,
              response.response.duplicateItemIdList || []
            )),
              (responseDTO.response = responseVM);
          } else {
            var itemsVM = {};
            (itemsVM.items = []), (responseDTO.response = itemsVM);
          }
          observable.notify(responseDTO);
        }),
        services.UTUtasRequestQueue.send(httpReq),
        observable
      );
    };
  }, 5000);
})();
