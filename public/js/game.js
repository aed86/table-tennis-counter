"use strict";

var Game = {
    availableStatuses: function() {
        return statuses;
    },
    init: function () {
        var self = this;
        self.id = $('#gameId').val();
        if (self.id) {
            self.getGameData(self.id).then(function (res) {
                if (res) {
                    self.gameData = res;
                    self.count(res);
                }
            });
        }
    },
    getGameData: function (id) {
        return $.ajax({
            type: 'GET',
            url: '/game/' + id + '/json'
        })
    },
    finishGame: function() {
        var id = this.id;
        $.ajax({
            type: 'POST',
            url: '/game/' + id + '/status/' + statuses['FINISH_STATUS'],
            success: function(response) {
                if (response.success) {
                    window.location.href= '/game/' + id + '/detail';
                }
            }
        })
    },
    count: function (game) {
        var self = this;
        var id = self.id;

        // убираем вызов контекстного меню при клике
        document.oncontextmenu = function () {
            return false;
        };

        var totalScore = {
            player1: {
                score: game.player1.score
            },
            player2: {
                score: game.player2.score
            },
            points: game.points,
            status: game.status
        };

        var currentSet = parseInt(totalScore.player1.score) + parseInt(totalScore.player2.score);

        $('.block').on('mousedown', function (e) {
            if (totalScore.status == statuses.FINISH_STATUS) {
                window.location.href= '/game/' + self.id + '/detail';
                return;
            }

            var $this = $(this);
            var player = $this.data('player');
            var opponent = player == 1 ? 2 : 1;
            var index = "player" + player;
            var $countContainer = $this.find('.count');
            var $opponentContainer = $this.parent().find('[data-player="' + opponent + '"]').find('.count');
            var $wonsContainer = $this.find('.wons');
            var isCorrected = (e.button === 2) || false; // Если нажата правая кнопка мыши
            var isNextSet = false;
            var point = 0;
            var opponentPoint = null;

            // Манипуляции при победе в сете
            var playerWinSet = function (player) {
                var index = "player" + player;
                point = 0;
                opponentPoint = 0;
                currentSet++;
                totalScore[index].score += 1;
                $wonsContainer.html(totalScore[index].score).addClass('animated bounceIn');
            };

            // Завершаем игру
            var checkMatchWin = function (totalScore) {
                if (totalScore.player1.score == 3 || totalScore.player2.score == 3) {
                    // Изменяем статус игры на завершенную
                    self.finishGame();
                }
            };

            if (totalScore.points.length < currentSet + 1) {
                totalScore.points.push({1: 0, 2: 0});
            }

            totalScore.points[currentSet][player] = parseInt(totalScore.points[currentSet][player]);

            if (isCorrected) {
                totalScore.points[currentSet][player] -= 1;
            } else {
                totalScore.points[currentSet][player] += 1;
            }

            if (totalScore.points[currentSet][player] < 0) {
                totalScore.points[currentSet][player] = 0
            }

            // Если было больше-меньше, и админ скорректировал счет "меньше" назад, то победа "больше"
            if (isCorrected && totalScore.points[currentSet][opponent] >= 10 && totalScore.points[currentSet][opponent] - totalScore.points[currentSet][player] > 1) {
                playerWinSet(opponent);
            } else if (totalScore.points[currentSet][player] >= 10 && totalScore.points[currentSet][player] == totalScore.points[currentSet][opponent]) {
                point = "=";
                opponentPoint = "=";
            } else if (totalScore.points[currentSet][player] >= 11) {
                if (totalScore.points[currentSet][player] - totalScore.points[currentSet][opponent] > 0) {
                    if (totalScore.points[currentSet][player] - totalScore.points[currentSet][opponent] > 1) {
                        playerWinSet(player);
                    } else {
                        point = ">";
                        opponentPoint = "<";
                    }
                }
            } else if (!isNextSet) {
                point = totalScore.points[currentSet][player];
            } else {
                point = 0;
                opponentPoint = 0;
                currentSet++;
            }

            $countContainer.html(point).addClass('animated bounceIn');
            if (opponentPoint !== null) {
                $opponentContainer.html(opponentPoint).addClass('animated bounceIn');
            }

            //TODO: Save data
            _.throttle(function () {
                self.saveGame(id, totalScore);
            }, 100)();
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

        var finished = false;

        // Убираем последние нулевые поинты если игра завершилась
        if (data.player1.score == 3 || data.player2.score == 3) {
            data.status = statuses['FINISH_STATUS'];
            finished = true;
        } else {
            data.status = statuses['PROCESS_STATUS'];
        }

        $.ajax({
            type: "POST",
            url: '/game/' + id + '/save',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (res) {
                if (!res.success) {
                    alert('Ошибка сохранения');
                } else {
                    if (finished) {
                        // Редирект на страницу информации об игре
                        window.location.href= '/game/' + id + '/detail';
                    }
                }
            }
        })
    }
};

Game.init();
