(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                            "<td>0 : 0</td>" +
                            "<td>" + player2Value + "</td>" +
                            "<td>" +
                                "<button data-id='" + response.id + "' class='play'>Игра</button>" +
                            "</td>" +
                            "<td>" +
                                "<a data-id='" + response.id + "' class='button' href='/detail/" + response.id + "'>...</a>" +
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
        $(document).on('click', '.play', function () {
            var id = $(this).data('id');
            $.ajax({
                type: 'POST',
                url: '/game/' + id + '/start',
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        window.location.href = '/game/' + id;
                    } else {
                        alert("Ошибка");
                    }
                }
            })
        });
    }
};

Table.init();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvanMvdGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUYWJsZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWRkUGxheWVycygpO1xuICAgICAgICB0aGlzLmRlbGV0ZVBsYXllcnMoKTtcbiAgICAgICAgdGhpcy5zdGFydEdhbWUoKTtcbiAgICB9LFxuICAgIGFkZFBsYXllcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2FkZC1wbGF5ZXJzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRwbGF5ZXIxID0gJCgnLmFkZC1wbGF5ZXIxJyk7XG4gICAgICAgICAgICB2YXIgJHBsYXllcjIgPSAkKCcuYWRkLXBsYXllcjInKTtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIxVmFsdWUgPSAkcGxheWVyMS52YWwoKTtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIyVmFsdWUgPSAkcGxheWVyMi52YWwoKTtcblxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6ICcvdGFibGUvYWRkJyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJwbGF5ZXIxXCI6IHBsYXllcjFWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgXCJwbGF5ZXIyXCI6IHBsYXllcjJWYWx1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzID0gXCJcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQ+XCIgKyBwbGF5ZXIxVmFsdWUgKyBcIjwvdGQ+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRkPjAgOiAwPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQ+XCIgKyBwbGF5ZXIyVmFsdWUgKyBcIjwvdGQ+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRkPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8YnV0dG9uIGRhdGEtaWQ9J1wiICsgcmVzcG9uc2UuaWQgKyBcIicgY2xhc3M9J3BsYXknPtCY0LPRgNCwPC9idXR0b24+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQ+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxhIGRhdGEtaWQ9J1wiICsgcmVzcG9uc2UuaWQgKyBcIicgY2xhc3M9J2J1dHRvbicgaHJlZj0nL2RldGFpbC9cIiArIHJlc3BvbnNlLmlkICsgXCInPi4uLjwvYT5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGJ1dHRvbiBkYXRhLWlkPSdcIiArIHJlc3BvbnNlLmlkICsgXCInIGNsYXNzPSdkZWxldGUtcGxheWVycyc+JnRpbWVzOzwvYnV0dG9uPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvdGQ+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJy5wbGF5ZXJzIHRhYmxlJykucHJlcGVuZChwbGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgJHBsYXllcjEudmFsKCcnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAkcGxheWVyMi52YWwoJycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsZXRlUGxheWVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZS1wbGF5ZXJzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRidG4gPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkRFTEVURVwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgdXJsOiAnL2dhbWUvJyArIGlkLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkYnRuLnBhcmVudHMoJ3RyJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RhcnRHYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucGxheScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogJy9nYW1lLycgKyBpZCArICcvc3RhcnQnLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9nYW1lLycgKyBpZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwi0J7RiNC40LHQutCwXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuVGFibGUuaW5pdCgpO1xuIl19
