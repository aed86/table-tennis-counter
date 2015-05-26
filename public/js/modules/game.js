"use strict";

var $ = require('jquery');
var _ = require('underscore');

var Game = {
    init: function () {
        var self = this;

        self.id = $('#gameId').val();
        self.getGameData(self.id).then(function(res) {
            self.gameData = res;
            self.count(res);
        });
    },
    getGameData: function (id) {
        console.log(id);
        return $.ajax({
            type: 'GET',
            url: '/game/' + id + '/json'
        })
    },
    count: function (game) {
        var self = this;
        var moreless = false;
        var id = self.id;
        var wons = {
            player1: game.player1.score,
            player2: game.player2.score
        };
        var currents = {
            player1: game.player1.point,
            player2: game.player2.point
        };

        // убираем вызов контекстного меню при клике
        document.oncontextmenu = function () {
            return false;
        };

        $('.block').on('mousedown', function (e) {
            var $this = $(this);
            var $count = $this.parents('.row').find('.count');
            var player = $this.data('player');
            var index = "player" + player;
            var current = currents[index];
            var won = wons[index];

            if (!moreless) {
                // если правая кнопка мыши
                if (e.button === 2) {
                    current -= 1;
                    if (current < 0) {
                        current = 0;
                    }
                    $this.find('.count').html(current);
                } else {
                    current += 1;
                    $this.find('.count').html(current).addClass('animated bounceIn');
                }

                // если по 10 у обоих, то игра - "больше-меньше"
                if ($count.eq(0).html() === '10' && $count.eq(1).html() === '10') {
                    $count.html('=');
                    moreless = true;
                }

                // если достиг 11 - выиграл
                if (current === 11) {
                    won += 1;

                    $this.find('.wons').html(won).addClass('animated bounceIn');
                    $count.html('0');

                    // окончательный выигрыш (игроки отыграли)
                    if (won === 3) {
                        $this.parents('.row').find('.count').remove();
                        setTimeout(function () {
                            self.nextGame($this.parents('.row').index() + 1);
                        }, 5000);
                    }
                }

                currents[index] = current == 11 ? 0 : current;

                wons[index] = won;

                var dataToSave = {
                    id: $('#gameId').val(),
                    player: player,
                    score: wons[index], // счет по сетам
                    point: currents[index] // счет в текущей партии
                };

                _.throttle(function () {
                    self.saveGame(id, dataToSave);
                }, 100)();


                if (current == 11) {
                    currents = {
                        player1: 0,
                        player2: 0
                    };
                }
            }
            // игра "больше-меньше"
            else {
                // если было поровну, то ставим нужному игроку "больше"
                if ($this.find('.count').html() === '=') {
                    $count.html('-').addClass('animated bounceIn');
                    $this.find('.count').html('+');
                }
                // если был 0, то уравниваем игроков
                else if ($this.find('.count').html() === '-') {
                    $count.html('=').addClass('animated bounceIn');
                }
                // если было "больше", то игрок выигрывает
                else if ($this.find('.count').html() === '+') {
                    won = parseInt($this.find('.wons').html());
                    $this.find('.wons').html(++won);
                    moreless = false;

                    // окончательный выигрыш (игроки отыграли)
                    if (won === 3) {
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
            }, 500);
        });
    },
    nextGame: function (index) {
        var $game = $('main.content .row');
        $game.addClass('hidden');
        $game.eq(index).removeClass('hidden');
    },
    saveGame: function (id, data) {
        if (id === undefined) {
            return;
        }

        $.ajax({
            type: "POST",
            url: '/game/' + id + '/save',
            data: data,
            success: function (res) {
                if (!res.success) {
                    alert('Ошибка сохранения');
                }
            }
        })
    }
};

module.exports = Game;
