"use strict";

var $ = require('jquery');

var Table = {
    init: function () {
        this.addPlayers();
    },
    addPlayers: function () {
        $('#add-players').on('click', function () {
            var $player1 = $('.add-player1');
            var $player2 = $('.add-player2');
            var player1Value = $player1.val();
            var player2Value = $player2.val();

            $.ajax({
                type: "POST",
                url: '/table/add',
                data: {
                    "player1": player1Value,
                    "player2": player2Value
                },
                success: function(response) {
                    //TODO: добавить сюда добавление строки
                }
            });

            var players = "" +
                "<tr>" +
                    "<td>" + player1Value + "</td>" +
                    "<td>0 : 0</td>" +
                    "<td>" + player2Value + "</td>" +
                    "<td>" +
                        "<button data-id='' class='play'>Play</button>" +
                    "</td>" +
                "</tr>";

            $('.players table').prepend(players);
            $player1.val('').focus();
            $player2.val('');
        });
    }
}

module.exports = Table;
