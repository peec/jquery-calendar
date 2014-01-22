/*
 * Plugin: Table-calendar.
 *
 * Usage:
 * $('table#mycalendartable').tableCalendar();
 *
 * Author: Petter Kjelkenes <pk@aplia.no>
 * Version: 1.1
 * Copyright (c) 2013 - Aplia AS
 */
;(function($) {

    $.fn.extend({
        tableCalendar: function (options) {
            var settings = $.extend({
                /**
                 * Day labels
                 */
                dayLabels: ["M", "T", "O", "T", "F", "L", "S"],
                /**
                 * What language to use. See the month object for available languages or add your own.
                 */
                language: 'nb_NO',
                /**
                 * All available languages.
                 */
                month: {
                    nb_NO: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"]
                },
                /**
                 * Data source can be overridden with custom call to API or just basic JSON array.
                 * Format must be [ {day: 1, name: "Something", ... custom attributes ...}, ... ]
                 *
                 * context: this = reference to instance of ApliaDateObject
                 *
                 * @param month The month in the calendar.
                 * @param year The year in the calendar
                 * @param callback Feed this callback with your data after data is fetched.
                 */
                datasource: function (month,year, callback) {
                    $.getJSON('/my_api/', {month: month, year: year}, function (data) {
                        callback(data);
                    });
                },
                /**
                 *
                 * @param item
                 * @param tdElement
                 * @returns {*}
                 */
                templateClickableDay: function (item, tdElement) {
                    tdElement.addClass("active");
                    tdElement.attr('title', item.name);
                    return item.day; // Can return forexample day + "<span></span>"
                },
                /**
                 * What to
                 * context: this = reference to instance of ApliaDateObject
                 */
                templateHeaderChange: function () {
                    this.$dom_month_label.text(this.getMonthName(this.month) + ", " + this.year);
                },
                /**
                 * context: this = reference to instance of ApliaDateObject
                 * @param day
                 */
                dayClickHandler: function (day) {
                    var data = this.getDayData(day);
                    data && this.redirectTo(data.href);

                }
            }, options);


            /**
             * Constructor creates base elements such as thead and tbody.
             *
             * @param $el
             * @constructor
             */
            var ApliaDateObject = function ($el) {
                this.el = $el;
                this.headEl = $('<thead></thead>');
                this.bodyEl = $('<tbody></tbody>');
                this.month = null;
                this.year = null;
                this.firstDayDate = null;
                this.daysInMonth = 0;
                this.weekDayStart = 0;
                this.dataDays = [];

                this.el.html("");
                this.el.append(this.headEl);
                this.el.append(this.bodyEl);

                this.headEl.append('<tr><th class="previous jsCalPreviousButton">&laquo;</th><th class="month jsCalMonthLabel" colspan="6"></th><th class="next jsCalNextButton">&raquo;</th></tr>');

                this.$dom_month_label = this.el.find('.jsCalMonthLabel');
                this.$dom_prev_label = this.el.find('.jsCalPreviousButton');
                this.$dom_next_label = this.el.find('.jsCalNextButton');

                // Build initital day labels...
                var trDayLabels = $('<tr></tr>').append('<th>&nbsp;</th>');
                $.each(settings.dayLabels, function (index, dayLetter) {
                    trDayLabels.append('<th>'+dayLetter+'</th>');
                });
                this.headEl.append(trDayLabels);


                this.bindInitialEvents();

                if (settings.datasource) {
                    this.setupDatasourceHandler();
                }
            };

            ApliaDateObject.prototype.redirectTo = function (href) {
                window.location.href = href;
            };

            ApliaDateObject.prototype.getDayData = function (day) {
                return this.dataDays[day];
            };

            ApliaDateObject.prototype.setupDatasourceCompleteHandler = function () {
                var that = this;
                return function (entries) {
                    $.each(entries, function (index, item) {
                        that.dataDays[item.day-1] = item; // Add
                        var $td = that.findDayTd(item.day-1);
                        $td.html(settings.templateClickableDay(item, $td));
                    });
                };
            };


            ApliaDateObject.prototype.findDayTd = function (day) {
                return this.bodyEl.find('td[data-day='+day+']');
            };



            ApliaDateObject.prototype.setupDatasourceHandler = function () {
                var that = this;
                this.el.on("apliacalendar:showMonth:after", function () {
                    settings.datasource.apply(that, [that.month, that.year, that.setupDatasourceCompleteHandler()]);
                });
            };


            ApliaDateObject.prototype.showMonth = function (year, month) {
                var $el = this.el;
                this.month = month;
                this.year = year;
                this.daysInMonth = new Date(year, month, 0).getDate();
                this.firstDayDate = new Date(year, month, 1);
                this.weekDayStart = this.getWeek(this.firstDayDate);

                this.el.trigger({
                    type: "apliacalendar:showMonth:before"
                });
                this.bodyEl.html("");
                this.generateHtml();
                this.el.trigger({
                    type: "apliacalendar:showMonth:after"
                });
            };


            ApliaDateObject.prototype.generateHtml = function () {
                settings.templateHeaderChange.apply(this);
                // Build the grid.

                var curDate = new Date();
                var $tr = null;
                var weekNumber = this.weekDayStart;
                for (var day = 0; day < this.daysInMonth; day++) {
                    if (day % 7 === 0) {
                        $tr = $('<tr></tr>');
                        $tr.append('<th class="week">'+weekNumber+'</th>');
                        this.bodyEl.append($tr);
                        weekNumber++;
                    }
                    // Day start at 0 , so display +1.
                    var $td = $('<td class="day" data-day="'+day+'">'+(day+1)+'</td>');
                    $td.click(this.setupDayClickHandler(day));

                    if (curDate.getFullYear() == this.year && curDate.getMonth() == this.month && curDate.getDate() == day) {
                        $td.addClass("current");
                    }

                    $tr.append($td);
                }
                // fill the rest of the tds with empty cells.
                if (this.daysInMonth > 28) {
                    for (var i = this.daysInMonth; i < 35; i++) {
                        $tr.append('<td class="day"></td>');
                    }
                }
            };

            /**
             * Sets up a click handler for the specific day.
             * @returns {Function}
             */
            ApliaDateObject.prototype.setupDayClickHandler = function (day) {
                var that = this;
                return function (e) {
                    settings.dayClickHandler.apply(that, [day, e]);
                };
            };

            /**
             * Makes sure to unbind all events to DOM children of tbody
             */
            ApliaDateObject.prototype.unbindBodyEvents = function () {
                this.bodyEl.find("td").off('click');
            };

            ApliaDateObject.prototype.bindInitialEvents = function () {
                var that = this;
                // Event: Click on the next button.
                this.$dom_next_label.click(function () {
                    var next = that.getNextDate();
                    that.unbindBodyEvents();
                    that.showMonth(next.getFullYear(), next.getMonth());
                });

                // Event: Click on the previous button.
                this.$dom_prev_label.click(function () {
                    var prev = that.getPreviousDate();
                    that.unbindBodyEvents();
                    that.showMonth(prev.getFullYear(), prev.getMonth());
                });
            };

            ApliaDateObject.prototype.getNextDate = function () {
                var current;
                if (this.firstDayDate.getMonth() == 11) {
                    current = new Date(this.firstDayDate.getFullYear() + 1, 0, 1);
                } else {
                    current = new Date(this.firstDayDate.getFullYear(), this.firstDayDate.getMonth() + 1, 1);
                }
                return current;
            };

            ApliaDateObject.prototype.getPreviousDate = function () {
                var current;
                if (this.firstDayDate.getMonth() == 0) {
                    current = new Date(this.firstDayDate.getFullYear() -1, 11, 1);
                } else {
                    current = new Date(this.firstDayDate.getFullYear(), this.firstDayDate.getMonth() - 1, 1);
                }
                return current;
            };

            ApliaDateObject.prototype.getMonthName = function (month) {
                return settings.month[settings.language][month];
            };

            ApliaDateObject.prototype.getDayLabel = function (day) {
                return settings.dayLabels[day];
            };


            /**
             * Based on Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com
             *
             * Returns the week number for date.  dowOffset is the day of week the week
             * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
             * the week returned is the ISO 8601 week number.
             * @param int dowOffset
             * @return int
             */
            ApliaDateObject.prototype.getWeek = function (date, dowOffset) {
                dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
                var newYear = new Date(date.getFullYear(),0,1);
                var day = newYear.getDay() - dowOffset; //the day of week the year begins on
                day = (day >= 0 ? day : day + 7);
                var daynum = Math.floor((date.getTime() - newYear.getTime() -
                    (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
                var weeknum;
                //if the year starts before the middle of a week
                if(day < 4) {
                    weeknum = Math.floor((daynum+day-1)/7) + 1;
                    if(weeknum > 52) {
                        nYear = new Date(date.getFullYear() + 1,0,1);
                        nday = nYear.getDay() - dowOffset;
                        nday = nday >= 0 ? nday : nday + 7;
                        /*if the next year starts before the middle of
                         the week, it is week #1 of that year*/
                        weeknum = nday < 4 ? 1 : 53;
                    }
                }
                else {
                    weeknum = Math.floor((daynum+day-1)/7);
                }
                return weeknum;
            };


            return this.each(function () {
                var $el = $(this);
                var a = new ApliaDateObject($el);
                a.showMonth(new Date().getFullYear(), new Date().getMonth());
            });
        }
    });

})(jQuery);