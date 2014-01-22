# jQuery Calendar

jQuery plugin to generate a functional calendar widget. Simple and lightweight. Created as alternative for jQuery UI's calendar.

- Support for JSON data from custom REST API's.
- Extensible


## Usage:

JS:

    $('table#mycalendar').tableCalendar({
    /* Settings */
    });

HTML:

    <table class="calendar"></table>

## Customization

The plugin can easily be configured with the specified settings:


### Available settings


#### dayLabels [array]

Used as the second row of the calendar to tell what day it is. By default, the first letter of the Day name is used (eg. M = Monday).

*Default value:*

    ["M", "T", "O", "T", "F", "L", "S"]


#### language [string]

Sets the current language used. Available languages are currently:

- en_GB
- nb_NO

#### month [object]

Contains available languages.

#### datasource [function: month, year, callback]

Used to get data of available events on the currently selected month. This must always be provided if you want your calendar days to be clickable. 

Call the `callback` function once data is loaded and provide the array into the first argument to callback.

Datasource can be set to `null` if you don't want any fetching of calendar events based on the month shown in the calendar.


##### Sample implementation 1.

Getting items from API. The API returns a json formatted array with one object per "event". 



    datasource: function (month,year, callback) {
        // Forexample we try get /calendarevents/?month=0&year=2014
        $.getJSON('/calendarevents/', {month: month, year: year}, function (data) {
            // data is now an array of event objects.
            callback(data);
        });
    }


The REST based JSON api might return something like this based on the following URL: `/calendarevents/?month=0&year=2014`. 


    [
    {
        day: 12,
        name: "JS Learning Course for beginners",
        some_custom_attribute: "blah blah"
    },
    {
        day: 23,
        name: "Advanced JS Learning Course",
        some_custom_attribute: "blah blah blah"
    }
    ]

*Note:* month goes from 0 - 11. So in the API logic you might need to increment the day by 1 before using date functions etc. Javascript has month from 0-11, normally 1-12 is used for calculation in other languages.


#### templateClickableDay [function: item, tdElement]

This function is called when a datasource is given. If day 23 has a event this function is called in the context of that day. Should return a HTML string or string. By default this will just return the `item.day`. 

The `item` variable refers to a item in the datasource array. So you can access `day`, `name`, and other custom attributes your `datasource` delivers.   

The `tdElement` is a jQuery object for the specific day `td`. 

By default we add a title tag to the `<td>` tag and add the class `active`.



#### templateHeaderChange [function]

Called when you change month. 

By default we run this code, which sets the middle top label to the month name and year:

    this.$dom_month_label.text(this.getMonthName(this.month) + ", " + this.year);


You may forexample configure to only show month name like so:

    templateHeaderChange: function () {
        this.$dom_month_label.text(this.getMonthName(this.month) + ", " + this.year);
    }


#### dayClickHandler [function: day]

When a day is clicked do the following.

The default implementation opens `item.href` and goes out of the current page. This ofcourse means that "href" must be delivered by the `datasource` / rest api. 

    dayClickHandler: function (day) {
        var data = this.getDayData(day);
        data && this.redirectTo(data.href);
    }




## License

Copyright (c) 2014 <Petter Kjelkenes, Aplia AS>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
