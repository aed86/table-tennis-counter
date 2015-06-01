"use strict";

var Table = {
    init: function () {
        this.addPlayers();
        this.deletePlayers();
        this.startGame();
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
                dataType: 'json',
                data: {
                    "player1": player1Value,
                    "player2": player2Value
                },
                success: function (response) {
                    var players = "" +
                        "<tr>" +
                            "<td>" + player1Value + "</td>" +
                            "<td>0 : 0" +
                            "<h5>Игра не начата</h5>" +
                            "</td>" +
                            "<td>" + player2Value + "</td>" +
                            "<td>" +
                                "<button data-id='" + response.id + "' class='play'><span>Игра</span></button>" +
                            "</td>" +
                            "<td>" +
                                "<button data-id='" + response.id + "' class='delete-players'>&times;</button>" +
                            "</td>" +
                        "</tr>";

                    $('.players table').prepend(players);
                    $player1.val('').focus();
                    $player2.val('');
                },
                error: function () {
                    alert('error');
                }
            });
        });
    },
    deletePlayers: function () {
        $(document).on('click', '.delete-players', function () {
            var $btn = $(this);
            var id = $(this).data('id');
            $.ajax({
                type: "DELETE",
                dataType: 'json',
                url: '/game/' + id,
                success: function (res) {
                    if (res.success) {
                        $btn.parents('tr').remove();
                    } else {
                        alert('error');
                    }
                }
            })
        });
    },
    startGame: function () {
        $(document).on('click', '.play, .detail', function () {
            var id = $(this).data('id');
            var detailPage = $(this).hasClass('detail');
            $.ajax({
                type: 'POST',
                url: '/game/' + id + '/start',
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        var detailPostfix = detailPage ? '/detail' : '';
                        window.location.href = '/game/' + id + detailPostfix;
                    } else {
                        alert("Ошибка");
                    }
                }
            })
        });
    }
};

Table.init();
