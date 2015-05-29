(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvanMvZ2FtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEdhbWUgPSB7XG4gICAgYXZhaWxhYmxlU3RhdHVzZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc3RhdHVzZXM7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5pZCA9ICQoJyNnYW1lSWQnKS52YWwoKTtcbiAgICAgICAgaWYgKHNlbGYuaWQpIHtcbiAgICAgICAgICAgIHNlbGYuZ2V0R2FtZURhdGEoc2VsZi5pZCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdhbWVEYXRhID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvdW50KHJlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldEdhbWVEYXRhOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogJy9nYW1lLycgKyBpZCArICcvanNvbidcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGZpbmlzaEdhbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaWQgPSB0aGlzLmlkO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL2dhbWUvJyArIGlkICsgJy9zdGF0dXMvJyArIHN0YXR1c2VzWydGSU5JU0hfU1RBVFVTJ10sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmPSAnL2dhbWUvJyArIGlkICsgJy9kZXRhaWwnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNvdW50OiBmdW5jdGlvbiAoZ2FtZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBpZCA9IHNlbGYuaWQ7XG5cbiAgICAgICAgLy8g0YPQsdC40YDQsNC10Lwg0LLRi9C30L7QsiDQutC+0L3RgtC10LrRgdGC0L3QvtCz0L4g0LzQtdC90Y4g0L/RgNC4INC60LvQuNC60LVcbiAgICAgICAgZG9jdW1lbnQub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdG90YWxTY29yZSA9IHtcbiAgICAgICAgICAgIHBsYXllcjE6IHtcbiAgICAgICAgICAgICAgICBzY29yZTogZ2FtZS5wbGF5ZXIxLnNjb3JlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGxheWVyMjoge1xuICAgICAgICAgICAgICAgIHNjb3JlOiBnYW1lLnBsYXllcjIuc2NvcmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb2ludHM6IGdhbWUucG9pbnRzLFxuICAgICAgICAgICAgc3RhdHVzOiBnYW1lLnN0YXR1c1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBjdXJyZW50U2V0ID0gcGFyc2VJbnQodG90YWxTY29yZS5wbGF5ZXIxLnNjb3JlKSArIHBhcnNlSW50KHRvdGFsU2NvcmUucGxheWVyMi5zY29yZSk7XG5cbiAgICAgICAgJCgnLmJsb2NrJykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAodG90YWxTY29yZS5zdGF0dXMgPT0gc3RhdHVzZXMuRklOSVNIX1NUQVRVUykge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmPSAnL2dhbWUvJyArIHNlbGYuaWQgKyAnL2RldGFpbCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIHBsYXllciA9ICR0aGlzLmRhdGEoJ3BsYXllcicpO1xuICAgICAgICAgICAgdmFyIG9wcG9uZW50ID0gcGxheWVyID09IDEgPyAyIDogMTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IFwicGxheWVyXCIgKyBwbGF5ZXI7XG4gICAgICAgICAgICB2YXIgJGNvdW50Q29udGFpbmVyID0gJHRoaXMuZmluZCgnLmNvdW50Jyk7XG4gICAgICAgICAgICB2YXIgJG9wcG9uZW50Q29udGFpbmVyID0gJHRoaXMucGFyZW50KCkuZmluZCgnW2RhdGEtcGxheWVyPVwiJyArIG9wcG9uZW50ICsgJ1wiXScpLmZpbmQoJy5jb3VudCcpO1xuICAgICAgICAgICAgdmFyICR3b25zQ29udGFpbmVyID0gJHRoaXMuZmluZCgnLndvbnMnKTtcbiAgICAgICAgICAgIHZhciBpc0NvcnJlY3RlZCA9IChlLmJ1dHRvbiA9PT0gMikgfHwgZmFsc2U7IC8vINCV0YHQu9C4INC90LDQttCw0YLQsCDQv9GA0LDQstCw0Y8g0LrQvdC+0L/QutCwINC80YvRiNC4XG4gICAgICAgICAgICB2YXIgaXNOZXh0U2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcG9pbnQgPSAwO1xuICAgICAgICAgICAgdmFyIG9wcG9uZW50UG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyDQnNCw0L3QuNC/0YPQu9GP0YbQuNC4INC/0YDQuCDQv9C+0LHQtdC00LUg0LIg0YHQtdGC0LVcbiAgICAgICAgICAgIHZhciBwbGF5ZXJXaW5TZXQgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gXCJwbGF5ZXJcIiArIHBsYXllcjtcbiAgICAgICAgICAgICAgICBwb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgb3Bwb25lbnRQb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgY3VycmVudFNldCsrO1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmVbaW5kZXhdLnNjb3JlICs9IDE7XG4gICAgICAgICAgICAgICAgJHdvbnNDb250YWluZXIuaHRtbCh0b3RhbFNjb3JlW2luZGV4XS5zY29yZSkuYWRkQ2xhc3MoJ2FuaW1hdGVkIGJvdW5jZUluJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDQl9Cw0LLQtdGA0YjQsNC10Lwg0LjQs9GA0YNcbiAgICAgICAgICAgIHZhciBjaGVja01hdGNoV2luID0gZnVuY3Rpb24gKHRvdGFsU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAodG90YWxTY29yZS5wbGF5ZXIxLnNjb3JlID09IDMgfHwgdG90YWxTY29yZS5wbGF5ZXIyLnNjb3JlID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g0JjQt9C80LXQvdGP0LXQvCDRgdGC0LDRgtGD0YEg0LjQs9GA0Ysg0L3QsCDQt9Cw0LLQtdGA0YjQtdC90L3Rg9GOXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmluaXNoR2FtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0b3RhbFNjb3JlLnBvaW50cy5sZW5ndGggPCBjdXJyZW50U2V0ICsgMSkge1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzLnB1c2goezE6IDAsIDI6IDB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9IHBhcnNlSW50KHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0pO1xuXG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdIC09IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPCAwKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9IDBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LHRi9C70L4g0LHQvtC70YzRiNC1LdC80LXQvdGM0YjQtSwg0Lgg0LDQtNC80LjQvSDRgdC60L7RgNGA0LXQutGC0LjRgNC+0LLQsNC7INGB0YfQtdGCIFwi0LzQtdC90YzRiNC1XCIg0L3QsNC30LDQtCwg0YLQviDQv9C+0LHQtdC00LAgXCLQsdC+0LvRjNGI0LVcIlxuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdGVkICYmIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW29wcG9uZW50XSA+PSAxMCAmJiB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0gLSB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdID4gMSkge1xuICAgICAgICAgICAgICAgIHBsYXllcldpblNldChvcHBvbmVudCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPj0gMTAgJiYgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9PSB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0pIHtcbiAgICAgICAgICAgICAgICBwb2ludCA9IFwiPVwiO1xuICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSBcIj1cIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA+PSAxMSkge1xuICAgICAgICAgICAgICAgIGlmICh0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdIC0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bb3Bwb25lbnRdID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSAtIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW29wcG9uZW50XSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcldpblNldChwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQgPSBcIj5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSBcIjxcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzTmV4dFNldCkge1xuICAgICAgICAgICAgICAgIHBvaW50ID0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvdW50Q29udGFpbmVyLmh0bWwocG9pbnQpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgaWYgKG9wcG9uZW50UG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAkb3Bwb25lbnRDb250YWluZXIuaHRtbChvcHBvbmVudFBvaW50KS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9UT0RPOiBTYXZlIGRhdGFcbiAgICAgICAgICAgIF8udGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2F2ZUdhbWUoaWQsIHRvdGFsU2NvcmUpO1xuICAgICAgICAgICAgfSwgMTAwKSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG5leHRHYW1lOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdmFyICRnYW1lID0gJCgnbWFpbi5jb250ZW50IC5yb3cnKTtcbiAgICAgICAgJGdhbWUuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAkZ2FtZS5lcShpbmRleCkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0sXG4gICAgc2F2ZUdhbWU6IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xuICAgICAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8g0KPQsdC40YDQsNC10Lwg0L/QvtGB0LvQtdC00L3QuNC1INC90YPQu9C10LLRi9C1INC/0L7QuNC90YLRiyDQtdGB0LvQuCDQuNCz0YDQsCDQt9Cw0LLQtdGA0YjQuNC70LDRgdGMXG4gICAgICAgIGlmIChkYXRhLnBsYXllcjEuc2NvcmUgPT0gMyB8fCBkYXRhLnBsYXllcjIuc2NvcmUgPT0gMykge1xuICAgICAgICAgICAgZGF0YS5zdGF0dXMgPSBzdGF0dXNlc1snRklOSVNIX1NUQVRVUyddO1xuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YS5zdGF0dXMgPSBzdGF0dXNlc1snUFJPQ0VTU19TVEFUVVMnXTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogJy9nYW1lLycgKyBpZCArICcvc2F2ZScsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXMuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBhbGVydCgn0J7RiNC40LHQutCwINGB0L7RhdGA0LDQvdC10L3QuNGPJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDQoNC10LTQuNGA0LXQutGCINC90LAg0YHRgtGA0LDQvdC40YbRgyDQuNC90YTQvtGA0LzQsNGG0LjQuCDQvtCxINC40LPRgNC1XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZj0gJy9nYW1lLycgKyBpZCArICcvZGV0YWlsJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59O1xuXG5HYW1lLmluaXQoKTtcbiJdfQ==
