$(document).ready(async function() {
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
    var toggle_d_day_status = true;
    var toggle_sort_mode = true;
    // 현재날짜 저장
    let pinnedStatus = false;
    /* ---------- search state ---------- */
    let currentSearchText  = '';       // what the user typed
    let currentSearchField = 'title';    // selected dropdown option
    var currentDate = new Date();
    var currentDate_daily = new Date();

    // DB에 있는 모든 데이터 저장
    var all_DB
    await axios.get('api/v1/calendar_list/')
        .then(res => {
            all_DB = res.data
        })
    
    function pad(num) {
        return num < 10 ? '0' + num : num;
    }

    var getTextLength = function(str) {
        function _escape(text) {
            var res = '', i;
            for(i = 0; i < text.length; i ++) {
              var c = text.charCodeAt(i);
              if(c < 256) res += encodeURIComponent(text[i]);
              else res += '%u' + c.toString(16).toUpperCase();
            }
            return res;
        }
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (_escape(str.charAt(i)).length == 6) {
                len++;
            }
            len++;
        }
        return len+1;
    }
    
    // calendar 만드는 함수
    async function generateCalendar(d, d_daily) {
        // Helper function for two-digit numbers
        
        // 날짜 계산 함수
        Date.prototype.monthDays = function() {
            var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
            return d.getDate();
        };
    
        var details = {
            totalDays: d.monthDays(),
            weekDays: ['일', '월', '화', '수', '목', '금', '토'],
            months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        };

        var start = new Date(d.getFullYear(), d.getMonth()).getDay();
    
        // 이전 달과 다음 달의 날짜를 계산하기 위한 날짜들
        var copycurrent1 = new Date(d.getFullYear(), d.getMonth(), 0);
        var copycurrent2 = new Date(d.getFullYear(), d.getMonth()+1);
        var restday = copycurrent1.getDate() - copycurrent1.getDay();
    
        var cal = [];
        var day = 1;
        var cnt = 1;
        var date_list = [];
    
        for (var i = 0; i <= 6; i++) {
            if (i == 0) {
                cal.push(['<div class="week-day">']);
            } else {
                cal.push(['<div class="week">']);
            }
            for (var j = 0; j < 7; j++) {
                if (i === 0) {
                    cal[i].push('<div class="day-name">' + details.weekDays[j] + '</div>');
                } else if (day > details.totalDays) {
                    // Use pad for month and day for next month dates
                    date_list.push(pad(copycurrent2.getMonth()+1) + '-' + pad(cnt) + '-' + copycurrent2.getFullYear());
                    cal[i].push(`<div class="day"><h3 id="${pad(copycurrent2.getMonth()+1)}-${pad(cnt)}-${copycurrent2.getFullYear()}" class="day-label">` + cnt++ + '</h3></div>');
                } else {
                    if (i === 1 && j < start) {
                        // For previous month dates
                        let prevMonth = pad(copycurrent1.getMonth()+1);
                        date_list.push(prevMonth + '-' + pad(restday) + '-' + copycurrent1.getFullYear());
                        cal[i].push(`<div class="day"><h3 id="${prevMonth}-${pad(restday)}-${copycurrent1.getFullYear()}" class="day-label">` + restday++ + '</h3></div>');
                    } else {
                        // For current month dates
                        let currentMonth = pad(d.getMonth()+1);
                        date_list.push(currentMonth + '-' + pad(day) + '-' + d.getFullYear());
                        cal[i].push(`<div class="day"><h3 id="${currentMonth}-${pad(day)}-${d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                    }
                }
            }
            cal[i].push('</div>');
            if (day > details.totalDays) {
                break;
            }
        }

        // Return the earliest date in `date_list` that falls inside [startTS, endTS].
        // If the event is completely outside the current view, return null.
        function firstVisibleKey(date_list, startTS, endTS) {
            for (let i = 0; i < date_list.length; i++) {
                const [m, d, y] = date_list[i].split('-').map(Number);
                const ts = new Date(y, m - 1, d).getTime();
                if (ts >= startTS && ts <= endTS) return date_list[i];
            }
            return null;
        }

        // 배열형태 cal를 string형태로 변환
        cal = cal.reduce(function(a, b) {
            return a.concat(b);
        }, []).join('');
        // 일정 데이터를 딕셔너리 형태로 저장, 키는 해당날짜 0000-00-00 
        var d_startdate = {}
        await all_DB.forEach(res => {
            const [sm, sd, sy] = res.start_day.split('-').map(Number);   // mm‑dd‑yyyy
            const [em, ed, ey] = res.end_day.split('-').map(Number);

            const startObj = new Date(sy, sm - 1, sd);
            const endObj   = new Date(ey, em - 1, ed);
            const startTS  = startObj.getTime();
            const endTS    = endObj  .getTime();
            const totalLen = Math.floor((endTS - startTS) / 86400000) + 1;   // days inclusive

            // ------------------------------------------------------------
            // 1️⃣  Which date in *this* month’s grid should act as “start”?
            // ------------------------------------------------------------
            const visibleKey = firstVisibleKey(date_list, startTS, endTS);
            if (!visibleKey) return;   // event is completely outside the view – skip

            // Re‑compute weekday & remaining length starting from that visible key
            const [vkM, vkD, vkY] = visibleKey.split('-').map(Number);
            const visObj      = new Date(vkY, vkM - 1, vkD);
            const offsetDays  = Math.floor((visObj.getTime() - startTS) / 86400000);
            const remaining   = totalLen - offsetDays;          // how many days left to paint

            // Flag: true if this is *not* the real first segment
            const isContinuation = offsetDays > 0;

            // ------------------------------------------------------------
            // 2️⃣  Build event_arr   (unchanged fields omitted for clarity)
            // ------------------------------------------------------------
            const totalSubtasks  = res.subtasks ? res.subtasks.length : 0;
            const doneSubtasks   = res.subtasks ? res.subtasks.filter(st => st.completed).length : 0;
            const summary        = ` (${doneSubtasks}/${totalSubtasks}) `;
            const dday           = Math.max(0, Math.floor((endTS - currentDate.getTime())/86400000));
            const titleWithSum   = `${res.title}${summary}${toggle_d_day_status ? ' D-' + dday : (em + '월 ' + ed + '일')}`;

            const event_arr = [
                remaining,               // 0  – length *from visibleKey*
                titleWithSum,            // 1
                visObj.getDay(),         // 2  – weekday of *visible* segment
                isContinuation,          // 3  – tells renderer “this is a mid‑chunk”
                res.start_day,           // 4
                res.end_day,             // 5
                res.start_time,          // 6
                res.end_time,            // 7
                res.content,             // 8
                totalLen > 1,            // 9  – is_continuous flag (unchanged)
                res.id,                  // 10
                res.color,               // 11
                startTS,                 // 12
                endTS,                   // 13
                totalSubtasks ? doneSubtasks/totalSubtasks : 1, // 14
                res.title,               // 15
                res.tags,                // 16
                !!res.pinned             // 17
            ];
            event_arr.push(res.subtasks || []);     // 18

            // ------------------------------------------------------------
            // 3️⃣  Store under the *visible* key
            // ------------------------------------------------------------
            if (visibleKey in d_startdate) d_startdate[visibleKey].push(event_arr);
            else                           d_startdate[visibleKey] = [event_arr];

        })
        // html에 띄우는 작업
        $('#div-list').append(cal);
        /* ----------------------------------------------------
        Highlight today (only if it is in the current month)
        ---------------------------------------------------- */
        (function markToday(){
            const now      = new Date();                           // today
            const idToday  = pad(now.getMonth()+1) + '-'           // "05-01-2025"
                        + pad(now.getDate())   + '-'
                        +  now.getFullYear();
        
            $('#' + idToday).addClass('today-label');              // <- CSS does the rest
        })();
        $('#months').text(details.months[d.getMonth()]);
        $('#year').text(d.getFullYear());
        $('td.day').mouseover(function() {
            $(this).addClass('hover');
        }).mouseout(function() {
            $(this).removeClass('hover');
        });
        
        // date_content 값 생성 및 일정 html 달력에 추가작업
        var day_cal = ['7', '6', '5', '4', '3', '2', '1']
        for (var key in d_startdate) {
            d_startdate[key].sort(function(a, b) {
                if (a[17] !== b[17]) return  a[17] - b[17];   //  pinned=true first
                if (toggle_sort_mode) {  // sort by start_date
                    if (a[12] !== b[12]) return b[12] - a[12];
                    else if (a[13] !== b[13]) return b[13] - a[13];
                    else if (a[14] !== b[14]) return b[14] - a[14];
                    else {
                        return b[15].localeCompare(a[15]);
                    }
                } else {  // sort by end_date
                    if (a[13] !== b[13]) return b[13] - a[13];
                    else if (a[12] !== b[12]) return b[12] - a[12];
                    else if (a[14] !== b[14]) return [14] - a[14];
                    else {
                        return b[15].localeCompare(a[15]);
                    }
                }
            });
        }

        for (var i in date_list) {
            if (date_list[i] in d_startdate) {
                d_startdate[date_list[i]].forEach(res => {
                    var brief_res_dict = {
                        id: res[10],
                        title: res[15],
                        start_day: res[4],
                        end_day: res[5],
                        start_time: res[6],
                        end_time: res[7],
                        content: res[8],
                        color: res[11],
                        subtasks: res[18],
                        tags: res[16],
                        pinned: res[17]
                    }
                    
                    if (Number(res[0]) > Number(day_cal[res[2]])) {
                        // console.log(`remain_date(0):${res[0]}`, `starting_week(2):${res[2]}`, `day_cal:${day_cal[res[2]]}`, `name:${res[15]}`, `is_con(9):${res[9]}`, `flag(3):${res[3]}`)
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            }
                        }

                        var share = date_list[i].split('-')
                        var new_date = new Date(share[2], share[0]-1, Number(share[1]) + Number(day_cal[res[2]]))
                        if (new_date.getMonth() + 1 < 10) {
                            if (new_date.getDate() < 10) {
                                var s_new_date = '0' + '' + (new_date.getMonth() + 1) + '-' + '0' + new_date.getDate() + '-' + new_date.getFullYear()
                            } else {
                                var s_new_date = '0' + '' + (new_date.getMonth() + 1) + '-' + new_date.getDate() + '-' + new_date.getFullYear()
                            }
                        } else {
                            if (new_date.getDate() < 10) {
                                var s_new_date = (new_date.getMonth() + 1) + '-' + '0' + new_date.getDate() + '-' + new_date.getFullYear()
                            } else {
                                var s_new_date = (new_date.getMonth() + 1) + '-' + new_date.getDate() + '-' + new_date.getFullYear()
                            }
    
                        }

                        var s_new_date_data = [Number(res[0]) - Number(day_cal[res[2]]), res[1], 0, true, res[4], res[5], res[6], res[7], res[8], res[9], res[10], res[11], res[12], res[13], res[14], res[15], res[16], res[17], res[18]]
                        if (s_new_date in d_startdate) {
                            d_startdate[s_new_date].push(s_new_date_data)
                        } else {
                            d_startdate[s_new_date] = [s_new_date_data]
                        }
                    } else {
                        // console.log(`eeeelse(0):${res[0]}`, `starting_week(2):${res[2]}`, `day_cal:${day_cal[res[2]]}`, `name:${res[15]}`, `is_con:${res[9]}`, `flag:${res[3]}`)
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event="${safeDataEvent(brief_res_dict)}">${res[1]}</div>`);
                            }
                        }
                    }
                })
            }
        }

        // 일정 클릭시 팝업으로 일정 상세내용이 나옴
        $(document).on('click', '.event, .event-consecutive, .event-repeated', function(e) {
            e.preventDefault();
            e.stopPropagation();
            let eventData = $(this).data('event');
            // Parse eventData if it's a string (due to JSON string in data-event attribute)
            if (typeof eventData === 'string') {
                try {
                    eventData = JSON.parse(eventData);
                } catch (err) {
                    console.error('Failed to parse event data:', err);
                }
            }
            pinnedStatus = !!eventData.pinned;
            $('#pinToggle').toggleClass('active', pinnedStatus)
                           .attr('aria-pressed', pinnedStatus);
            // Clear existing subtasks
            $('#subtasksContainer').empty();
            if (eventData) {
                // Pre-fill the modal form with event data
                $('#recipient-name').val(eventData.title);
                $('#start-day').val(eventData.start_day);
                $('#end-day').val(eventData.end_day);
                $('#start-time').val(eventData.start_time);
                $('#end-time').val(eventData.end_time);
                // $('#message-text').val(eventData.content);
                fillMemo(eventData.content);
                // Set the color
                selectedColor = eventData.color;
                $('#colorSelector .color-circle').removeClass('selected');
                $(`#colorSelector .color-circle[data-color="${eventData.color}"]`).addClass('selected');
                // Pre-fill tags if available
                if (!eventData.tags) {
                    eventData.tags = $(this).find('.grid-tags').text().trim();
                }
                $('#todoTags').val(eventData.tags || '');
                // Load and render subtasks if available
                if (eventData.subtasks && eventData.subtasks.length > 0) {
                    eventData.subtasks.forEach(function (st) {
                        /* use the same builder that new rows use  */
                        const $row = makeSubTaskRow(st.text, st.completed);
                    
                        /* if you keep the older HTML builder, just call
                           addHitBox( $row ) afterwards              */
                    
                        $('#subtasksContainer').append($row);
                    });
                    $('#subtasksContainer .subtask-item').each(function () {
                        enterPreview( $(this) );
                    });
                }
                updateSubtaskProgress();
                // Store the event ID for update/delete operations
                $('#registerSchedule').data('eventId', eventData.id);
            }
            $('#registerSchedule').modal('show');
        });

        // 달력클릭시 일정작성 폼이 나옴
        $(document).on('click', '.week', function (e) {
            console.log(e)
            /* ---------------------------------------------------------
               Which column inside this .week was clicked?
               --------------------------------------------------------- */
            const weekRect   = this.getBoundingClientRect();
            const colWidth   = weekRect.width / 7;               // 7 columns
            const offsetX    = e.clientX - weekRect.left;        // px from left edge
            const colIndex   = Math.floor(offsetX / colWidth);   // 0 → 6
        
            /* ---------------------------------------------------------
               Grab that column’s <h3 class="day‑label"> and its id
               --------------------------------------------------------- */
            const $dayLabel  = $(this)                 //  <div class="week">
                               .children('.day')       //  all seven <div class="day">
                               .eq(colIndex)           //  the N‑th one
                               .find('h3.day-label');  //  its header
            const dateId     = $dayLabel.attr('id');   //  "05-02-2025"
        
            if (!dateId) return;                       // safety guard
        
            const cutdate    = dateId.replaceAll('-', '/');
        
            /* -------- open “new todo” modal pre‑filled with that date ------- */
            $('#recipient-name, #end-day, #start-time, #end-time, #message-text, #todoTags')
                .val('');
            $('#start-day').val(cutdate);
            $('#end-day').val(cutdate);
            $('#subtasksContainer').empty();
            updateSubtaskProgress();
        
            selectedColor = '';
            $('#colorSelector .color-circle').removeClass('selected');
            resetMemoToggle();
            $('#registerSchedule')
                .removeData('eventId')
                .modal('show');
            $('#pinToggle').removeClass('active').attr('aria-pressed', false);
        });
        generateDaily(d_daily)
        filterTodos();    // keep current search in effect        
    }
    //day_view
    async function generateDaily(d_daily) {
        var current_day = new Date(d_daily);
        current_day.setDate(current_day.getDate());
        var startRange = new Date(d_daily);
        var endRange = new Date(d_daily);
        endRange.setDate(endRange.getDate() + 30);
        var uniqueEvents = {};

        // First pass: collect all events to calculate maximum widths
        var maxTitleLength = 0;
        var maxSummaryLength = 0;
        var maxDdayLength = 0;

        all_DB.forEach(res => {
            const sParts = res.start_day.split('-');
            const eParts = res.end_day.split('-');
            let eventStart = new Date(sParts[2], sParts[0] - 1, sParts[1]);
            let eventEnd = new Date(eParts[2], eParts[0] - 1, eParts[1]);
            let eventEndPlus = new Date(eParts[2], eParts[0] - 1, Number(eParts[1]) + 1);

            if (eventStart < endRange && eventEndPlus > startRange) {
                if (!(res.id in uniqueEvents)) {
                    var totalSubtasks = res.subtasks ? res.subtasks.length : 0;
                    var completedSubtasks = 0;
                    if (res.subtasks) {
                        completedSubtasks = res.subtasks.filter(function(st) { return st.completed; }).length;
                    }
                    var subtaskSummary = "(" + completedSubtasks + "/" + totalSubtasks + ")";
                    var remaining = Math.floor((eventEnd.getTime() - d_daily.getTime()) / (1000 * 60 * 60 * 24));
                    var d_day_str = 'D-' + (remaining > 0 ? remaining : '0');

                    // Update maximum lengths with proper character count
                    maxTitleLength = Math.max(maxTitleLength, getTextLength(res.title)); // Korean characters are wider
                    maxSummaryLength = Math.max(maxSummaryLength, subtaskSummary.length);
                    maxDdayLength = Math.max(maxDdayLength, d_day_str.length * 1.3);
                }
            }
        });

        // Second pass: create events with grid layout
        all_DB.forEach(res => {
            const sParts = res.start_day.split('-');
            const eParts = res.end_day.split('-');
            let eventStart = new Date(sParts[2], sParts[0] - 1, sParts[1]);
            let eventEnd = new Date(eParts[2], eParts[0] - 1, eParts[1]);
            let eventEndPlus = new Date(eParts[2], eParts[0] - 1, Number(eParts[1]) + 1);

            if (eventStart < endRange && eventEndPlus > startRange) {
                if (!(res.id in uniqueEvents)) {
                    var totalSubtasks = res.subtasks ? res.subtasks.length : 0;
                    var completedSubtasks = 0;
                    if (res.subtasks) {
                        completedSubtasks = res.subtasks.filter(function(st) { return st.completed; }).length;
                    }
                    var subtaskSummary = " (" + completedSubtasks + "/" + totalSubtasks + ") ";
                    var remaining = Math.floor((eventEnd.getTime() - d_daily.getTime()) / (1000 * 60 * 60 * 24));
                    var d_day_str = 'D-' + (remaining > 0 ? remaining : '0');
                    var date_range_str = (pad(eventStart.getFullYear()-2000)) + '.' + (pad(eventStart.getMonth() + 1)) + "." + pad(eventStart.getDate()) + ' ~ ' +
                                         (pad(eventEnd.getFullYear()-2000)) + '.' + (pad(eventEnd.getMonth() + 1)) + "." + pad(eventEnd.getDate());
                    
                    // Create grid layout with fixed-width columns
                    var titleWithSummary = `
                        <div class="event-grid">
                            <div class="grid-title" style="width: ${maxTitleLength}ch">${res.title}</div>
                            <div class="grid-summary" style="width: ${maxSummaryLength}ch">${subtaskSummary}</div>
                            <div class="grid-dday" style="width: ${maxDdayLength}ch">${d_day_str}</div>
                            <div class="grid-date-range" style="width: ${18}ch">${date_range_str}</div>                       
                            <div class="grid-tags">${res.tags || ''}</div>
                        </div>
                    `;

                    var startTS = eventStart.getTime();
                    var endTS = eventEnd.getTime();
                    var subtaskRatio = (totalSubtasks > 0) ? (completedSubtasks / totalSubtasks) : 1;
                    var html = "";
                var brief_res_dict = {
                    id: res. id,
                    title: res.title,
                    start_day: res.start_day,
                    end_day: res.end_day,
                    start_time: res.start_time,
                    end_time: res.end_time,
                    content: res.content,
                    color: res.color,
                    subtasks: res.subtasks,
                    tags: res.tags,
                    pinned: res.pinned
                }
                if (res.start_day === res.end_day) {
                        html = `<div class="event event-start event-end" style="background-color: ${res.color}; color:#fff;" data-event="${safeDataEvent(brief_res_dict)}">${titleWithSummary}</div>`;
                } else {
                        html = `<div class="event-consecutive event-start event-end" style="background-color: ${res.color}; color:#fff;" data-event="${safeDataEvent(brief_res_dict)}">${titleWithSummary}</div>`;
                    }

                    uniqueEvents[res.id] = {
                        pinned : !!res.pinned,
                        sortStart: startTS,
                        sortEnd: endTS,
                        ratio: subtaskRatio,
                        origTitle: res.title,
                        html: html
                    };
                }
            }
        });

        var eventsList = Object.values(uniqueEvents);
        eventsList.sort(function(a, b) {
            // disabled pinned first temporarily
            if (a.pinned !== b.pinned) return  b.pinned - a.pinned;
            if (toggle_sort_mode) {
                if (a.sortEnd !== b.sortEnd) return a.sortEnd - b.sortEnd;
                else if (a.sortStart !== b.sortStart) return a.sortStart - b.sortStart;
                else if (a.ratio !== b.ratio) return a.ratio - b.ratio;
                else {
                    return a.origTitle.localeCompare(b.origTitle);
                }
            } else {
                if (a.sortStart !== b.sortStart) return a.sortStart - b.sortStart;
                else if (a.sortEnd !== b.sortEnd) return a.sortEnd - b.sortEnd;
                else if (a.ratio !== b.ratio) return a.ratio - b.ratio;
                else return a.origTitle.localeCompare(b.origTitle);
            }
        });

        var weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        var header = `<span class="day-name">${d_daily.getDate()}일 ${weekDays[d_daily.getDay()]}요일</span>`;
        var content = header;
        eventsList.forEach(function(event) {
            content += event.html;
        });

        $('#day').html(`<div class="daily-calendar">${content}</div>`);
        if ($('#tab-day').attr('aria-selected') === 'true'){
            $('#months').text(d_daily.getMonth() + 1);   // 1 – 12
            $('#year').text(d_daily.getFullYear());
        }
        $('#day .event, #day .event-consecutive').each(function () {
            let data = $(this).data('event');
            if (typeof data === 'string') {         // stored as JSON string
                try { data = JSON.parse(data); }    // → parse it
                catch(e) { return; }                // malformed – skip
            }
            if (data && data.pinned) {              // the flag you store
                $(this).addClass('pinned');         // add the CSS hook
            }
        });
    }

    // -- modal form subtasks --
    var selectedColor = '#4285F4'; // default color

    /*  replace *only* the HTML string that builds a sub-task row  */
    function makeSubTaskRow (text = '', completed = false) {
        /* a unique id so <label for="…"> works */
        const uid = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);

        return $(`<div class="subtask-item d-flex align-items-center mb-2">
                    <!-- ➊ the real checkbox -->
                    <input  id="${uid}"
                            type="checkbox"
                            class="subtask-check mr-2"
                            ${completed ? 'checked' : ''}>

                    <!-- ➋ the invisible hit-box  -->
                    <label  for="${uid}"
                            class="subtask-hitbox"></label>

                    <!-- ➌ the text field -->
                    <input  type="text"
                            class="subtask-text form-control"
                            placeholder="세부 할 일"
                            value="${text}">
                    
                    <button type="button"
                            class="btn btn-danger btn-sm remove-subtask ml-2">-</button>
                </div>`);
    }

    /* whenever you add a row … */
    $('#addSubtask').on('click', function () {
        $('#subtasksContainer').append( makeSubTaskRow() );
        updateSubtaskProgress();
    });

    // Function to update the subtask progress indicator
    function updateSubtaskProgress() {
        var total = $('#subtasksContainer .subtask-item').length;
        var completed = 0;
        $('#subtasksContainer .subtask-item').each(function() {
           if ($(this).find('.subtask-check').prop('checked')) {
               completed++;
           }
        });
        $('#completedCount').text(completed);
        $('#totalCount').text(total);
    }

    /* -----------------------------------------------
    Preview ↔︎ Edit helpers for a single row
    ------------------------------------------------ */
    function enterPreview($row) {
        const $input   = $row.find('.subtask-text');
        let   $preview = $row.find('.subtask-preview');
    
        /* create preview once */
        if (!$preview.length) {
        $preview = $('<div class="subtask-preview"></div>');
        $input.after($preview);
        }
    
        $preview.text($input.val() || '');   // sync text
        $input.hide();
        $preview.show();
    
        /* re-enable D-n-D */
        if (subtasksSortable) subtasksSortable.option('disabled', false);
    }
    
    function enterEdit($row) {
        const $input   = $row.find('.subtask-text');
        const $preview = $row.find('.subtask-preview');
    
        $preview.hide();
        $input.show().focus();
    
        /* disable D-n-D while typing */
        if (subtasksSortable) subtasksSortable.option('disabled', true);
    }
    /* click on the preview → edit */
    $(document).on('click', '.subtask-preview', function () {
        enterEdit( $(this).closest('.subtask-item') );
    });
    
    /* leave the input → back to preview */
    $(document).on('blur',  '.subtask-text', function () {
        enterPreview( $(this).closest('.subtask-item') );
    });
    
    /* keep preview text live while typing */
    $(document).on('input', '.subtask-text', function () {
        $(this).siblings('.subtask-preview').text(this.value);
    });

    // Update progress when a subtask checkbox changes state
    $(document).on('change', '.subtask-check', function() {
        updateSubtaskProgress();
    });

    // Delegated event: Color selection - highlight and record the selected color
    $(document).on('click', '#colorSelector .color-circle', function() {
        // console.log('Color clicked: ', $(this).data('color'));
        selectedColor = $(this).data('color');
        $('#colorSelector .color-circle').removeClass('selected');
        $(this).addClass('selected');
    });

    /* pin button click */
    $(document).on('click', '#pinToggle', function () {
        pinnedStatus = !pinnedStatus;
        $(this).toggleClass('active')
            .attr('aria-pressed', pinnedStatus);
    });

    // Delegated event: Save (create/update) button
    $(document).on('click', '#create', async function() {
        const data = new FormData();
        data.append('title', $('#recipient-name').val());
        data.append('start_day', $('#start-day').val());
        data.append('end_day', $('#end-day').val());
        data.append('start_time', $('#start-time').val());
        data.append('end_time', $('#end-time').val());
        data.append('content', $('#message-text').val());
        data.append('color', selectedColor);
        // Gather dynamic subtasks from the form
        var subtasks = [];
        $('#subtasksContainer .subtask-item').each(function() {
            var completed = $(this).find('.subtask-check').prop('checked');
            var text = $(this).find('.subtask-text').val();
            subtasks.push({ completed: completed, text: text });
        });
        data.append('subtasks', JSON.stringify(subtasks));
        // Append the tags from the tag input field
        data.append('tags', $('#todoTags').val());
        data.append('pinned', pinnedStatus ? 'True' : 'False');
        
        const eventId = $('#registerSchedule').data('eventId');
        if (eventId) {
            await axios.put(`api/v1/calendar_update/${eventId}/`, data);
        } else {
            await axios.post('api/v1/calendar_create/', data);
        }
        
        $('#registerSchedule').modal('hide');
        
        // Refresh data from the server
        await axios.get('api/v1/calendar_list/')
            .then(res => { all_DB = res.data; });
        
        $('#div-list').empty();
        generateCalendar(currentDate, currentDate_daily);
    });

    // Delegated event: Delete button
    $(document).on('click', '#deleteSchedule', async function() {
        if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
            const eventId = $('#registerSchedule').data('eventId');
            if (eventId) {
                try {
                    await axios.delete(`api/v1/calendar_delete/${eventId}/`);
                    // Hide the modal
                    $('#registerSchedule').modal('hide');
                    
                    // Clear both views
                    $('#div-list').empty();
                    $('#day').empty();
                    
                    // Refresh the data from the server
                    await axios.get('api/v1/calendar_list/')
                        .then(res => {
                            all_DB = res.data;
                        });
                    
                    generateCalendar(currentDate, currentDate_daily);
                } catch (error) {
                    console.error('Error deleting event:', error);
                    alert('일정 삭제 중 오류가 발생했습니다.');
                }
            }
        }
    });

    // today클릭시 현재날짜로 이동
    $('#todaymove').click(function() {
        $('#div-list').text('');
        $('#day').text('');
        if ($('#tab-month').attr( 'aria-selected' ) === 'true'){
            currentDate = new Date();
        } else {
            currentDate_daily = new Date();
        }
        generateCalendar(currentDate, currentDate_daily);
    });
    // 달, 일에 따라 날짜 이동
    $('#left').click(function() {
        $('#div-list').empty();
        $('#day').empty();
        if ($('#tab-month').attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        } else {
            currentDate_daily.setDate(currentDate_daily.getDate() - 1);
        }
        // console.log(`currentDate: ${currentDate}`);
        generateCalendar(currentDate, currentDate_daily);
    });
    $('#right').click(function() {
        $('#div-list').empty();
        $('#day').empty();
        if ($('#tab-month').attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        } else {
            currentDate_daily.setDate(currentDate_daily.getDate() + 1);
        }
        // console.log(`currentDate: ${currentDate}`);
        generateCalendar(currentDate, currentDate_daily);
    });
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        if (e.target.id === 'tab-day') {            // Day tab just became active
            $('#months').text(currentDate_daily.getMonth() + 1);
            $('#year'  ).text(currentDate_daily.getFullYear());
    
        } else if (e.target.id === 'tab-month') {   // back to Month tab
            $('#months').text(currentDate.getMonth() + 1);
            $('#year'  ).text(currentDate.getFullYear());
        }
    });

    // modal에 하루종일 클릭시 시간설정 막음
    $('#inlineCheckbox2').click(function() {
        if ($('#inlineCheckbox2').is(":checked")) {
            $('[name="start_time"]').attr("readonly", true);
            $('[name="end_time"]').attr("readonly", true);
        } else {
            $('[name="start_time"]').attr("readonly", false);
            $('[name="end_time"]').attr("readonly", false);
        }

    });
    generateCalendar(currentDate, currentDate_daily);

    // Toggle between d-day view and end date view when clicking the newly added button.
    $(document).on('click', '#toggleSummary', function() {
        toggle_d_day_status = !toggle_d_day_status;
        // Optionally update button text to reflect current mode
        $(this).text(toggle_d_day_status ? 'D-DAY' : '마감일');
        // Clear and re-generate the calendar (assuming currentDate is in scope)
        $('#div-list').html('');
        $('#day').html('');
        generateCalendar(currentDate, currentDate_daily);
    });

    // Toggle sorting between end_date and start_date
    $(document).on('click', '#toggleSort', function() {
        toggle_sort_mode = !toggle_sort_mode;
        $(this).text(toggle_sort_mode ? '마감일순' : '시작일순');
        // Re-generate the calendar (both month and day views) with the new sort order
        $('#div-list').html('');
        $('#day').html('');
        generateCalendar(currentDate, currentDate_daily);
    });

    /* ---------- search input listeners ---------- */
    $(document).on('input',  '#searchInput', function () {
        currentSearchText = this.value;
        filterTodos();
    });
    $(document).on('change', '#searchField', function () {
        currentSearchField = this.value;
        filterTodos();
    });


    // New delegated event: Remove subtask row when '-' button is clicked
    $(document).on('click', '.remove-subtask', function() {
        $(this).closest('.subtask-item').remove();
        updateSubtaskProgress();
    });

    /* Modal accessibility fix: ensure that when the modal is hidden, its focused elements are blurred and it is marked as inert, and when shown, the inert attribute is removed */
    $('#registerSchedule').on('hide.bs.modal', function() {
        $(this).find(':focus').blur();
        $(this).attr('inert', 'true').removeAttr('aria-hidden');
    });

    $('#registerSchedule').on('show.bs.modal', function() {
        $(this).removeAttr('inert');
    });

    /* ------------------------------------------------------------------
    ➊  Toggle the memo section
    ------------------------------------------------------------------ */
    $(document).on('click', '#toggleMemo', function () {
        const $btn     = $(this);
        const $memo    = $('#message-text');
        const $preview = $('#memoPreview');
    
        const isClosed = !$memo.is(':visible') && !$preview.is(':visible');
    
        if (isClosed) {
            /* first click → show preview only */
            switchToPreview();          // show preview, hide textarea
            $btn.addClass('open');      // arrow rotates
        } else {
            /* second click → hide everything */
            $memo.hide();
            $preview.hide();
            $btn.removeClass('open');   // arrow back
        }
    });

    /* -----------------------------------------------------------
   ➊  Convert plain URLs to <a href="…"> links
   ----------------------------------------------------------- */
    /* --------------------------------------------------
    2.  Harden linkify so undefined/null won’t crash
    -------------------------------------------------- */
    function linkify (text) {
        if (!text) return '';
      
        /* grab every http/https URL */
        const urlRE = /(https?:\/\/[^\s]+)/gi;
      
        return text.replace(urlRE, function (url) {
          /* strip query/hash before testing the extension */
          const clean = url.split(/[?#]/)[0].toLowerCase();
      
          /* list of image extensions you care about */
          const imgRE = /\.(png|jpe?g|gif|bmp|webp|svg)$/;
      
          /* choose the label */
          const label = imgRE.test(clean) ? '[IMAGE_PREVIEW]' : url;
      
          /* build the anchor */
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        });
    }
    /* --------------------------------------------------
    insert text at the current caret position
    -------------------------------------------------- */
    function insertTextAtCaret (ta, text) {
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
    }

    /* ---------- quick helpers ---------- */
    function switchToEdit() {
        const $memo    = $('#message-text');
        const $preview = $('#memoPreview');
    
        /* ① remember how tall the preview is right now */
        const previewHeight = $preview.outerHeight();

        /* ② swap widgets */
        $preview.hide();
        $memo.show().focus();

        /* ③ give the textarea exactly the same height */
        $memo[0].style.height = previewHeight + 'px';
    }
    function switchToPreview() {
        const $memo    = $('#message-text');
        const $preview = $('#memoPreview');
    
        /* render hyperlinks */
        $preview.html( linkify( $memo.val() ) );
    
        /* ④ let the preview grow to fit the content of the textarea */
        $preview[0].style.height = 'auto';                 // reset first
        $preview[0].style.height = $memo[0].scrollHeight + 'px';
    
        $preview.show();
        $memo.hide();
    }
    function getOffsetFromPoint(el, x, y) {
        let range;
    
        if (document.caretRangeFromPoint) {                       // Chrome / Edge
            range = document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint) {             // Firefox
            const pos = document.caretPositionFromPoint(x, y);
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.setEnd  (pos.offsetNode, pos.offset);
        } else {
            /* very old browsers – fall back to “end of text” */
            return $('#message-text').val().length;
        }
    
        /* length of text from element start → clicked point */
        const pre = range.cloneRange();
        pre.selectNodeContents(el);
        pre.setEnd(range.endContainer, range.endOffset);
        return pre.toString().length;
    }

    /* -------------------------------------------------------------
    Hide / show todos in both month‑ and day‑views
    ------------------------------------------------------------- */
    function filterTodos () {
        const txt   = currentSearchText.trim().toLowerCase();
        const field = currentSearchField;          // "all" | "title" | …

        /* nothing typed  →  show everything & return */
        if (!txt) {
            $('.event, .event-consecutive, .event-repeated')
                .removeClass('d-none');
            return;
        }

        $('.event, .event-consecutive, .event-repeated').each(function () {
            let data = $(this).data('event');
            if (typeof data === 'string') {             // stored as JSON string
                try   { data = JSON.parse(data); }
                catch { return; }                       // malformed → show?
            }

            /* collect candidate strings */
            const title    = (data.title    || '').toLowerCase();
            const tags     = (data.tags     || '').toLowerCase();
            const content     = (data.content  || '').toLowerCase();
            let subtasksArr = [];

            if (Array.isArray(data.subtasks)) {
                subtasksArr = data.subtasks;                  // ← normal case
            } else if (typeof data.subtasks === 'string') {
                try {                                         // ← maybe it's a JSON string
                    const parsed = JSON.parse(data.subtasks);
                    if (Array.isArray(parsed)) subtasksArr = parsed;
                } catch { /* ignore – leave empty */ }
            }

            const subtasks = subtasksArr
                            .map(st => st.text || '')        // guard missing .text
                            .join(' ')
                            .toLowerCase();

            /* decide */
            let hit = false;
            switch (field) {
                case 'title'   : hit = title   .includes(txt);           break;
                case 'tags'    : hit = tags    .includes(txt);           break;
                case 'subtasks': hit = subtasks.includes(txt);           break;
                case 'content' : hit = content .includes(txt);           break;
                case 'all'     : hit = title.includes(txt) ||
                                tags.includes(txt)  ||
                                content.includes(txt)  ||
                                subtasks.includes(txt)
                                break;
                default        : title   .includes(txt);
            }

            $(this).toggleClass('d-none', !hit);   // hide if no match
        });
    }

    /* ---------- click & blur logic ---------- */
    /* ---------- click-to-edit WITH exact caret placement ---------- */
    $(document).off('click', '#memoPreview');          // remove old handler
    $(document).on( 'click', '#memoPreview', function (e) {

        /* ----------------------------------------------------------
        ① find the character-offset in the preview that was clicked
        ---------------------------------------------------------- */
        const idx = getOffsetFromPoint(this, e.clientX, e.clientY);

        /* ----------------------------------------------------------
        ② open the textarea …
        ---------------------------------------------------------- */
        switchToEdit();

        /* … and ③ drop the caret at that character position         */
        const $memo = $('#message-text');
        /* `setSelectionRange` must run *after* the textarea is shown,
        so we defer it with a micro-task                            */
        Promise.resolve().then(() => {
            $memo[0].setSelectionRange(idx, idx);
        });
    });
    $(document).on('blur' , '#message-text', switchToPreview);  // leave edit

    /* keep preview live while typing */
    $(document).on('input', '#message-text', function () {
        /* auto-grow textarea */
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';

        /* keep preview in sync (for when user blurs) */
        const $preview = $('#memoPreview');
        $preview.html(linkify(this.value));
        $preview[0].style.height = 'auto';
        $preview[0].style.height = $preview[0].scrollHeight + 'px';
    });
    /* --------------------------------------------------
    allow “Copy image” → paste URL in #message-text
    -------------------------------------------------- */
    $(document).on('paste', '#message-text', function (evt) {
        const cd = evt.originalEvent.clipboardData;
        if (!cd) return;                         // very old browsers
    
        /* grab the HTML fragment (if any) */
        const html = cd.getData('text/html');
        if (!html) return;                       // no HTML → let browser handle
    
        /* look for <img … src="…"> */
        const holder = document.createElement('div');
        holder.innerHTML = html;
        const img = holder.querySelector('img');
        if (!img || !img.src) return;            // none found → let browser handle
    
        /* we *did* find a src — prevent default paste and inject the URL */
        evt.preventDefault();
        insertTextAtCaret(this, img.src);
    
        /* keep the live-preview in sync */
        $(this).trigger('input');
    });
    
    /* ---------- opening / resetting the memo ---------- */
    function resetMemoToggle () {
        $('#message-text').val('').hide();
        $('#memoPreview').hide();       // keep whatever html was there, just hide
        $('#toggleMemo').removeClass('open');
    }
    
    /* new todo (click empty cell) */
    $(document).on('click', '.week', function () {
        resetMemoToggle();
        $('#registerSchedule').modal('show');
    });
    
    /* existing todo */
    function fillMemo(content) {
        $('#toggleMemo').removeClass('open');
        $('#message-text').val(content);         // keep the value
        $('#memoPreview').html(linkify(content))
                        .hide();                 // but stay hidden
    }


    /* -----------------------------------------------
    1.  keep a single Sortable instance per modal
    ------------------------------------------------ */
    let subtasksSortable = null;

    $('#registerSchedule').on('shown.bs.modal', function () {
        /* destroy previous instance (e.g. between edits) */
        if (subtasksSortable) subtasksSortable.destroy();

        subtasksSortable = new Sortable(
            document.getElementById('subtasksContainer'),
            {
                animation: 150,           // nice slide animation (ms)
                ghostClass: 'subtask-ghost',
                chosenClass: 'subtask-chosen',
                forceFallback: true       // works inside <input>
            }
        );
    });
});

String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}


function isEmpty(str){
    
    if(typeof str == "undefined" || str == null || str == "")
        return true;
    else
        return false ;
}

function nvl(str, defaultStr){
    
    if(typeof str == "undefined" || str == null || str == "")
        str = defaultStr ;
    
    return str ;
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$(function () {
    $('#view li:first-child a').tab('show')
});

$(function () {
    $('#datetimepicker1').datetimepicker({
        format: 'L'
    });
    $('#datetimepicker3').datetimepicker({
        format: 'L'
    });
});

$(function () {
    $('#datetimepicker2').datetimepicker({
        format: 'LT'
    });
    $('#datetimepicker4').datetimepicker({
        format: 'LT'
    });
});

/* --------------------------------------------------
   helpers
-------------------------------------------------- */
function escapeAttr(str) {
    return str
        .replace(/&/g,  '&amp;')   // always escape “&” first
        .replace(/"/g,  '&quot;')  // for data-event="…"
        .replace(/'/g,  '&#39;');  // just in case you switch to ' … '
}

function safeDataEvent(obj) {
    return escapeAttr(JSON.stringify(obj));
}

/* --------------------------------------------------
   make sure every .subtask-check has a hit-box label
-------------------------------------------------- */
function addHitBox ($subtaskItem) {
    const $cb = $subtaskItem.find('.subtask-check');

    /* already upgraded? → nothing to do */
    if ($subtaskItem.find('.subtask-hitbox').length) return;

    /* guarantee the checkbox has an id */
    let id = $cb.attr('id');
    if (!id) {
        id = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        $cb.attr('id', id);
    }

    /* inject the label right after the checkbox           */
    /* (position:absolute in CSS keeps layout untouched)    */
    $('<label class="subtask-hitbox" for="' + id + '"></label>')
        .insertAfter($cb);
}