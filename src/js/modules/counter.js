"use strict";

var $ = require('jquery');

var Counter = {
    init: function () {
        var self = this;

        // нажатие на кнопку начала игры
        $('.sidebar .play').on('click', function () {
            var players = self.getData();
            self.parseData(players);
            self.count();

            $('.sidebar').remove();
            $('.content').removeClass('blur');
        });

        // нажатие на кнопку добавления игроков
        $('.add-players').on('click', function () {
            self.pasteNewPlayers();
        });
    },
    getData: function () {
        var players = [];

        $('.sidebar .players .row').each(function () {
            var player1 = $(this).find('input').eq(0).val();
            var player2 = $(this).find('input').eq(1).val();

            if (player1 !== '' && player2 != '') {
                players.push({
                    "player1": player1,
                    "player2": player2
                });
            }
        });

        return players;
    },
    parseData: function (response) {
        var $gamesContainer = $('main.content').hide().empty();

        response.map(function (game) {
            function parseName (name) {
                var newName = name.split(' ');
                if (!newName[1]) {
                    newName[1] = '&nbsp;';
                }
                return newName[0] + "<br>" + newName[1];
            }

            var htmlItem = "" +
                "<div class='row'>" +
                    "<div class='block col-md-12 text-center left-side'>" +
                        "<div class='name'>" + parseName(game.player1) + "</div>" +
                        "<div class='count'>0</div>" +
                        "<div class='wons'>0</div>" +
                    "</div>" +
                    "<div class='block col-md-12 text-center'>" +
                        "<div class='name'>" + parseName(game.player2) + "</div>" +
                        "<div class='count'>0</div>" +
                        "<div class='wons'>0</div>" +
                    "</div>" +
                "</div>";

            $gamesContainer.append(htmlItem).show();
            $gamesContainer.find('.row').addClass('hidden');
            $gamesContainer.find('.row').eq(0).removeClass('hidden');
        });
    },
    pasteNewPlayers: function () {
        var players = "" +
            "<div class='row'>" +
                "<div class='col-md-12 text-center'>" +
                    "<input type='text' placeholder='name surname'>" +
                "</div>" +
                "<div class='col-md-12 text-center'>" +
                    "<input type='text' placeholder='name surname'>" +
                "</div>" +
            "</div>";

        $('.sidebar .players').append(players);
    },
    count: function () {
        var self = this;
        var moreless = false;

        // убираем вызов контекстного меню при клике
        document.oncontextmenu = function () {
            return false;
        };

        $('.block').on('mousedown', function (e) {
            var $count = $(this).parents('.row').find('.count');

            if (!moreless) {
                // увеличиваем счетчик
                var current = parseInt($(this).find('.count').html());

                // если правая кнопка мыши
                if (e.button === 2) {
                    $(this).find('.count').html(--current);
                } else {
                    $(this).find('.count').html(++current).addClass('animated bounceIn');
                }

                // если по 10 у обоих, то игра - "больше-меньше"
                if ($count.eq(0).html() === '10' && $count.eq(1).html() === '10') {
                    $count.html('=');
                    moreless = true;
                }

                // если достиг 11 - выиграл
                if (current === 11) {
                    var won =  parseInt($(this).find('.wons').html());
                    $(this).find('.wons').html(++won).addClass('animated bounceIn');
                    $count.html('0');

                    // окончательный выигрыш (игроки отыграли)
                    if (won === 3) {
                        var $this = $(this);
                        $this.parents('.row').find('.count').remove();
                        setTimeout(function () {
                            self.nextGame($this.parents('.row').index() + 1);
                        }, 5000);
                    }
                }
            }
            // игра "больше-меньше"
            else {
                // если было поровну, то ставим нужному игроку "больше"
                if ($(this).find('.count').html() === '=') {
                    $count.html('-').addClass('animated bounceIn');
                    $(this).find('.count').html('+');
                }
                // если был 0, то уравниваем игроков
                else if ($(this).find('.count').html() === '-') {
                    $count.html('=').addClass('animated bounceIn');
                }
                // если было "больше", то игрок выигрывает
                else if ($(this).find('.count').html() === '+') {
                    won =  parseInt($(this).find('.wons').html());
                    $(this).find('.wons').html(++won);
                    moreless = false;

                    // окончательный выигрыш (игроки отыграли)
                    if (won === 3) {
                        var $this = $(this);
                        $this.parents('.row').find('.count').remove();
                        setTimeout(function () {
                            self.nextGame($this.parents('.row').index() + 1);
                        }, 5000);
                    }
                    // выигрыш в игре (продолжаем)
                    else {
                        $count.html('0').addClass('animated bounceIn');
                    }
                }
            }

            setTimeout(function () {
                $('.count, .wons').removeClass('animated bounceIn');
            },500);
        });
    },
    nextGame: function (index) {
        var $game = $('main.content .row');
        $game.addClass('hidden');
        $game.eq(index).removeClass('hidden');
    }
}

module.exports = Counter;
