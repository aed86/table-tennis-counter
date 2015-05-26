"use strict";

var $ = require('jquery');

var Table = {
    init: function () {
        this.addPlayers();
        this.deletePlayers();
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
                success: function (response) {
                    var players = "" +
                        "<tr>" +
                            "<td>" + player1Value + "</td>" +
                            "<td>0 : 0</td>" +
                            "<td>" + player2Value + "</td>" +
                            "<td>" +
                                "<button data-id='" + response.id + "' class='play'>Play</button>" +
                            "</td>" +
                        "</tr>";

                    $('.players table').prepend(players);
                    $player1.val('').focus();
                    $player2.val('');
                },
                error: function () {
                    // TODO: show error
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
                    "<td>" +
                        "<button data-id='' class='delete-players'>&times;</button>" +
                    "</td>" +
                "</tr>";

            $('.players table').prepend(players);
            $player1.val('').focus();
            $player2.val('');
        });
    },
    deletePlayers: function () {
        $('.delete-players').on('click', function () {
            var id = $(this).data('id');
            $.ajax({
                type: "DELETE",
                url: '/table/' + id,
                success: function (res) {
                    if (res.success) {
                        console.log('removed');
                    } else {
                        console.log('error');
                    }
                }
            })
        });
    }
};

module.exports = Table;
