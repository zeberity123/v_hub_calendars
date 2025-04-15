$(document).ready(async function() {
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
    var toggle_d_day_status = true;
    var toggle_sort_mode = true;
    // 현재날짜 저장
    var currentDate = new Date();

    // Add a global variable to track the current view mode
    var currentView = 'month'; // default to month view

    // DB에 있는 모든 데이터 저장
    var all_DB
    await axios.get('api/v1/calendar_list/')
        .then(res => {
            all_DB = res.data
        })
    
    // calendar 만드는 함수
    async function generateCalendar(d) {
        // currentDate는 값이 바뀔 수 있기 떄문에 따로 현재 날짜 저장
        var todayDate = new Date()
        // 날짜를 0000-00-00 형식으로 저장
        var string_today
        if (todayDate.getMonth() + 1 < 10) {
            if (todayDate.getDate() < 10) {
                string_today = todayDate.getFullYear() + '-' + '0' + '' + (todayDate.getMonth()+1) + '-' + '0' + todayDate.getDate()
            } else {
                string_today = todayDate.getFullYear() + '-' + '0' + '' + (todayDate.getMonth()+1) + '-' + todayDate.getDate()
            }
        } else {
            if (todayDate.getDate() < 10) {
                string_today = todayDate.getFullYear() + '-' + (todayDate.getMonth()+1) + '-' + '0' + todayDate.getDate()
            } else {
                string_today = todayDate.getFullYear() + "-" + (todayDate.getMonth()+1) + "-" + todayDate.getDate()
            }
        }
        
        // 날짜 계산 함수
        Date.prototype.monthDays = function() {
            var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
            return d.getDate();
        };
        // 계산하기 편하게 요번달 말 날짜, 요일, 달을 딕셔너리에 저장
        var details = {
            totalDays: d.monthDays(),
            weekDays: ['일', '월', '화', '수', '목', '금', '토'],
            months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        };

        // 달이 시작하는 요일
        var start = new Date(d.getFullYear(), d.getMonth()).getDay();
        // 이번 달에 이전 달 뒷부분 날짜를 달기위한 날짜 계산
        var copycurrent1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var copycurrent2 = new Date(currentDate.getFullYear(), currentDate.getMonth()+1);
        var restday = copycurrent1.getDate() - copycurrent1.getDay()
        // 달력을 만들기 위한 변수 cal은 html, day는 날짜, cnt는 다음달 날짜, date_list는 달력에 있는 날짜 리스트
        var cal = [];
        var day = 1;
        var cnt = 1;
        var date_list = []
        // 달력 만드는 for문
        for (var i = 0; i <= 6; i++) {
            // i == 0일때 달력 요일을 달고, 아닐때 날짜 달기
            if (i == 0) {
                cal.push(['<div class="week-day">']);
            } else {
                cal.push(['<div class="week">']);
            }
            for (var j = 0; j < 7; j++) {
                if (i === 0) {
                    cal[i].push('<div class="day-name">' + details.weekDays[j] + '</div>');
                } else if (day > details.totalDays) {
                    date_list.push(copycurrent2.getMonth()+1 + '-' + '0' + cnt + '-' + copycurrent2.getFullYear())
                    cal[i].push(`<div class="day"><h3 id="${copycurrent2.getMonth()+1 + '-' + '0' + cnt + '-' + copycurrent2.getFullYear()}" class="day-label">` + cnt++ + '</h3></div>');
                } else {
                    if (i === 1 && j < start) {
                        if (copycurrent1.getMonth()+1 < 10) {
                            date_list.push('0' + '' + (copycurrent1.getMonth()+1) + '-' + restday + '-' + copycurrent1.getFullYear())
                            cal[i].push(`<div class="day"><h3 id="${'0' + '' + (copycurrent1.getMonth()+1) + '-' + restday + '-' + copycurrent1.getFullYear()}" class="day-label">` + restday++ + '</h3></div>');
                        } else {
                            date_list.push(copycurrent1.getMonth()+1 + '-' + restday + '-' + copycurrent1.getFullYear())
                            cal[i].push(`<div class="day"><h3 id="${copycurrent1.getMonth()+1 + '-' + restday + '-' + copycurrent1.getFullYear()}" class="day-label">` + restday++ + '</h3></div>');
                        }
                    } else {
                        if (d.getMonth()+1 < 10) {
                            if (day < 10) {
                                date_list.push('0' + '' + (d.getMonth()+1) + '-' + '0' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${'0' + '' + (d.getMonth()+1) + '-' + '0' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            } else {
                                date_list.push('0' + '' + (d.getMonth()+1) + '-' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${'0' + '' + (d.getMonth()+1) + '-' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            }
                        } else {
                            if (day < 10) {
                                date_list.push(d.getMonth()+1 + '-' + '0' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${d.getMonth()+1 + '-' + '0' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            } else {
                                date_list.push(d.getMonth()+1 + '-' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${d.getMonth()+1 + '-' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            }
                        }
                    }
                }
            }
            
            cal[i].push('</div>');

            if (day > details.totalDays) {
                break;
            }
        }
        // 배열형태 cal를 string형태로 변환
        cal = cal.reduce(function(a, b) {
            return a.concat(b);
        }, []).join('');
        // 일정 데이터를 딕셔너리 형태로 저장, 키는 해당날짜 0000-00-00 
        var d_startdate = {}
        await all_DB.forEach(res => {
            const s_day_0 = res.start_day.split('-')
            const e_day_0 = res.end_day.split('-')
            // 연속일정인지 단일일정인지 판단
            var judge = (res.start_day === res.end_day) ? false : true;
            // 각각 해당 날짜 저장
            const diff_d0 = new Date(s_day_0[2], s_day_0[0]-1, s_day_0[1])
            const diff_d2 = new Date(e_day_0[2], e_day_0[0]-1, e_day_0[1])
            
            const diff = Math.floor((diff_d2.getTime() - diff_d0.getTime()) / 1000 / 60 / 60 / 24)
            const diff_d_day = Math.floor((diff_d2.getTime() - d.getTime()) / 1000 / 60 / 60 / 24)
            // Compute summary
            var totalSubtasks = res.subtasks ? res.subtasks.length : 0;
            var completedSubtasks = 0;
            if (res.subtasks) {
                completedSubtasks = res.subtasks.filter(function(st) { return st.completed; }).length;
            }
            var summary = " (" + completedSubtasks + "/" + totalSubtasks + ") ";
            var d_day_str = 'D-' + (diff_d_day > 0 ? diff_d_day : '0');
            var end_date_month = ''
            var end_date_day = ''
            if (!isEmpty(e_day_0[0])){
                var end_date_month = e_day_0[0].replace(/^0+/, '');
            } else {
                end_date_month = '*'
            }
            
            if (!isEmpty(e_day_0[0])){
                var end_date_day = e_day_0[1].replace(/^0+/, '');
            } else {
                end_date_day = '*'
            }
            var end_date_str = end_date_month + "월 " + end_date_day + "일";
            var toggle_str = toggle_d_day_status ? d_day_str : end_date_str;
            var titleWithSummary = res.title + summary +  toggle_str;

            // Compute start and end timestamps:
            var startTS = diff_d0.getTime();
            var endTS = diff_d2.getTime();
            // Compute subtask ratio (if there are no subtasks, treat as 1)
            var subtaskRatio = (totalSubtasks > 0) ? (completedSubtasks / totalSubtasks) : 1;

            // Push array including extra sorting keys:
            var event_arr = [
                 diff+1,                 // index 0: event length (not used in sort)
                 titleWithSummary,       // index 1: title with appended summary and d-day/end date string
                 diff_d0.getDay(),       // index 2: starting weekday (not used in sort)
                 false,                  // index 3: some flag (not used in sort)
                 `${diff_d0.getFullYear()}년 ${diff_d0.getMonth()+1}월 ${diff_d0.getDate()}일`, // index 4: formatted start (for display)
                 `${diff_d2.getFullYear()}년 ${diff_d2.getMonth()+1}월 ${diff_d2.getDate()}일`, // index 5: formatted end (for display)
                 res.start_time,         // index 6: start time
                 res.end_time,           // index 7: end time
                 res.content,            // index 8: content
                 judge,                  // index 9: judge flag
                 res.id,                 // index 10: id
                 res.color,              // index 11: color
                 startTS,                // index 12: startTS for sorting
                 endTS,                  // index 13: endTS for sorting
                 subtaskRatio,           // index 14: subtask ratio for sorting
                 res.title,               // index 15: original title for alphabetical sort
            ];
            
            event_arr.push(res.subtasks || []); // index16: subtasks
            event_arr.raw = res;
            
            if (res.start_day in d_startdate) {
                 d_startdate[res.start_day].push(event_arr);
            } else {
                 d_startdate[res.start_day] = [ event_arr ];
            }

        })
        // html에 띄우는 작업
        $('#div-list').append(cal);
        $('#months').text(details.months[d.getMonth()]);
        $('#year').text(d.getFullYear());
        $('td.day').mouseover(function() {
            $(this).addClass('hover');
        }).mouseout(function() {
            $(this).removeClass('hover');
        });
        //month_view
        generateDaily(d)
        // date_content 값 생성 및 일정 html 달력에 추가작업
        var day_cal = ['7', '6', '5', '4', '3', '2', '1']
        for (var key in d_startdate) {
            d_startdate[key].sort(function(a, b) {
                if (toggle_sort_mode) {  // sort by start_date
                    if (a[12] !== b[12]) return b[12] - a[12];
                    else if (a[13] !== b[13]) return b[13] - a[13];
                    else if (a[14] !== b[14]) return b[14] - a[14];
                    else {
                        // var wafwf = 1;
                        // console.log('sdadwdafwaf', a[wafwf],b[wafwf]);
                        return a[15].localeCompare(b[15]);
                    }
                } else {  // sort by end_date
                    if (a[13] !== b[13]) return b[13] - a[13];
                    else if (a[12] !== b[12]) return b[12] - a[12];
                    else if (a[14] !== b[14]) return [14] - a[14];
                    else return a[15].localeCompare(b[15]);
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
                        subtasks: res[16]
                    }
                    // console.log('data: ', res[10], JSON.stringify(res.raw || brief_res_dict));
                    // console.log('data: ', res[2], res[1], res[11], 'data_end', JSON.stringify(brief_res_dict));
                    console.log('data: ', res[10], JSON.stringify(res.raw));
                    if (Number(res[0]) > Number(day_cal[res[2]])) {
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
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

                        if (s_new_date in d_startdate) {
                            d_startdate[s_new_date].push([Number(res[0]) - Number(day_cal[res[2]]), res[1], 0, true, res[4], res[5], res[6], res[7], res[8], res[9], res[11], res[11]])
                        } else {
                            d_startdate[s_new_date] = [[Number(res[0]) - Number(day_cal[res[2]]), res[1], 0, true, res[4], res[5], res[6], res[7], res[8], res[9], res[11], res[11]]]
                        }

                    } else {
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-event='${JSON.stringify(res.raw || brief_res_dict)}'>${res[1]}</div>`);
                            }
                        }
                    }
                })
            }
        }

        // 일정 클릭시 팝업으로 일정 상세내용이 나옴
        $(document).on('click', '.event, .event-consecutive, .event-repeated', function(e) {
            e.preventDefault();
            let eventData = $(this).data('event');
            // Parse eventData if it's a string (due to JSON string in data-event attribute)
            if (typeof eventData === 'string') {
                try {
                    eventData = JSON.parse(eventData);
                } catch (err) {
                    console.error('Failed to parse event data:', err);
                }
            }
            // Clear existing subtasks
            $('#subtasksContainer').empty();
            if (eventData) {
                // Pre-fill the modal form with event data
                $('#recipient-name').val(eventData.title);
                $('#start-day').val(eventData.start_day);
                $('#end-day').val(eventData.end_day);
                $('#start-time').val(eventData.start_time);
                $('#end-time').val(eventData.end_time);
                $('#message-text').val(eventData.content);
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
                    eventData.subtasks.forEach(function(subtask) {
                        var newRow = $("<div class='subtask-item d-flex align-items-center mb-2'>" +
                                       "<input type='checkbox' class='subtask-check mr-2'>" +
                                       "<input type='text' class='subtask-text form-control' placeholder='세부 할 일'>" +
                                       "<button type='button' class='btn btn-danger btn-sm remove-subtask ml-2'>-</button>" +
                                       "</div>");
                        newRow.find('.subtask-check').prop('checked', subtask.completed);
                        newRow.find('.subtask-text').val(subtask.text);
                        $('#subtasksContainer').append(newRow);
                    });
                }
                updateSubtaskProgress();
                // Store the event ID for update/delete operations
                $('#registerSchedule').data('eventId', eventData.id);
            }
            $('#registerSchedule').modal('show');
        });

        // 달력클릭시 일정작성 폼이 나옴
        $('.week, .daily-calendar').click(function(e) {
            var cutdate = e.target.id.replaceAll('-', '/');
            // Clear form fields for a new todo
            $('#recipient-name').val('');
            $('#start-day').val(cutdate);
            $('#end-day').val('');
            $('#start-time').val('');
            $('#end-time').val('');
            $('#message-text').val('');
            $('#todoTags').val('');
            
            // Clear subtasks container
            $('#subtasksContainer').empty();
            
            // Reset subtask progress indicators
            updateSubtaskProgress();

            // Reset color selection (assume no default color is selected)
            selectedColor = '';
            $('#colorSelector .color-circle').removeClass('selected');
            
            // Remove stored event ID to treat as a new event
            $('#registerSchedule').removeData('eventId');
            
            // Show the modal
            $('#registerSchedule').modal('show');
        });
    }
    //day_view
    async function generateDaily(d) {
        var current_day = new Date(d);
        current_day.setDate(current_day.getDate());
        var startRange = new Date(d);
        var endRange = new Date(d);
        endRange.setDate(endRange.getDate() + 30);
        var uniqueEvents = {};

        // First pass: collect all events to calculate maximum widths
        var maxTitleLength = 0;
        var maxSummaryLength = 0;
        var maxDdayLength = 0;
        var maxEndDateLength = 0;
        var maxStartDateLength = 0;

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
                    var remaining = Math.floor((eventEnd.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                    var d_day_str = 'D-' + (remaining > 0 ? remaining : '0');
                    var end_date_str = '마감일: ' + (eventEnd.getMonth() + 1) + "월 " + eventEnd.getDate() + "일";
                    var start_date_str = '시작일: ' + (eventStart.getMonth() + 1) + "월 " + eventStart.getDate() + "일";

                    // Update maximum lengths with proper character count
                    maxTitleLength = Math.max(maxTitleLength, res.title.length * 2.5); // Korean characters are wider
                    maxSummaryLength = Math.max(maxSummaryLength, subtaskSummary.length);
                    maxDdayLength = Math.max(maxDdayLength, d_day_str.length * 1.3);
                    maxEndDateLength = Math.max(maxEndDateLength, end_date_str.length * 1.5);
                    maxStartDateLength = Math.max(maxStartDateLength, start_date_str.length * 1.5);
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
                    var remaining = Math.floor((eventEnd.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                    var d_day_str = 'D-' + (remaining > 0 ? remaining : '0');
                    var end_date_str = '마감일: ' + (eventEnd.getMonth() + 1) + "월 " + eventEnd.getDate() + "일";
                    var start_date_str = '시작일: ' + (eventStart.getMonth() + 1) + "월 " + eventStart.getDate() + "일";

                    // Create grid layout with fixed-width columns
                    var titleWithSummary = `
                        <div class="event-grid">
                            <div class="grid-title" style="width: ${maxTitleLength}ch">${res.title}</div>
                            <div class="grid-summary" style="width: ${maxSummaryLength}ch">${subtaskSummary}</div>
                            <div class="grid-dday" style="width: ${maxDdayLength}ch">${d_day_str}</div>
                            <div class="grid-end-date" style="width: 16.5ch">${end_date_str}</div>
                            <div class="grid-start-date" style="width: ${maxStartDateLength}ch">${start_date_str}</div>
                            <div class="grid-tags">${res.tags || ''}</div>
                        </div>
                    `;

                    var startTS = eventStart.getTime();
                    var endTS = eventEnd.getTime();
                    var subtaskRatio = (totalSubtasks > 0) ? (completedSubtasks / totalSubtasks) : 1;
                    var html = "";

                if (res.start_day === res.end_day) {
                        html = `<div class="event event-start event-end" style="background-color: ${res.color}; color:#fff;" data-event='${JSON.stringify(res.raw || {
                            id: res.id,
                            title: res.title,
                            start_day: res.start_day,
                            end_day: res.end_day,
                            start_time: res.start_time,
                            end_time: res.end_time,
                            content: res.content,
                            color: res.color,
                            subtasks: res.subtasks
                        })}'>${titleWithSummary}</div>`;
                } else {
                        html = `<div class="event-consecutive event-start event-end" style="background-color: ${res.color}; color:#fff;" data-event='${JSON.stringify(res.raw || {
                            id: res.id,
                            title: res.title,
                            start_day: res.start_day,
                            end_day: res.end_day,
                            start_time: res.start_time,
                            end_time: res.end_time,
                            content: res.content,
                            color: res.color,
                            subtasks: res.subtasks
                        })}'>${titleWithSummary}</div>`;
                    }

                    uniqueEvents[res.id] = {
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
            if (toggle_sort_mode) {
                if (a.sortEnd !== b.sortEnd) return a.sortEnd - b.sortEnd;
                else if (a.sortStart !== b.sortStart) return a.sortStart - b.sortStart;
                else if (a.ratio !== b.ratio) return a.ratio - b.ratio;
                else return a.origTitle.localeCompare(b.origTitle);
            } else {
                if (a.sortStart !== b.sortStart) return a.sortStart - b.sortStart;
                else if (a.sortEnd !== b.sortEnd) return a.sortEnd - b.sortEnd;
                else if (a.ratio !== b.ratio) return a.ratio - b.ratio;
                else return a.origTitle.localeCompare(b.origTitle);
            }
        });

        var weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        var header = `<span class="day-name">${d.getDate()}일 ${weekDays[d.getDay()]}요일</span>`;
        var content = header;
        eventsList.forEach(function(event) {
            content += event.html;
        });

        $('#day').html(`<div class="daily-calendar">${content}</div>`);
    }

    // -- NEW MODAL ENHANCEMENTS --

    // Remove any previous binding for the create button
    $(document).off('click', '#create');

    var selectedColor = '#4285F4'; // default color

    // Delegated event: Add new subtask row when '+' is clicked
    $(document).on('click', '#addSubtask', function() {
        var newRow = $('<div class="subtask-item d-flex align-items-center mb-2">' +
                       '<input type="checkbox" class="subtask-check mr-2">' +
                       '<input type="text" class="subtask-text form-control" placeholder="세부 할 일">' +
                       '<button type="button" class="btn btn-danger btn-sm remove-subtask ml-2">-</button>' +
                       '</div>');
        $('#subtasksContainer').append(newRow);
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

    // Update progress when a subtask checkbox changes state
    $(document).on('change', '.subtask-check', function() {
        updateSubtaskProgress();
    });

    // Delegated event: Color selection - highlight and record the selected color
    $(document).on('click', '#colorSelector .color-circle', function() {
        console.log('Color clicked: ', $(this).data('color'));
        selectedColor = $(this).data('color');
        $('#colorSelector .color-circle').removeClass('selected');
        $(this).addClass('selected');
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
        
        // Refresh the view based on the current view mode
        if (currentView === 'daily') {
            $('#day').empty();
            generateDaily(currentDate);
        } else {
            $('#div-list').empty();
            generateCalendar(currentDate);
        }
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
                    
                    // Regenerate the calendar based on current view mode
                    if (currentView === 'daily') {
                        generateDaily(currentDate);
                    } else {
                        generateCalendar(currentDate);
                    }
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
        currentDate = new Date()
        generateCalendar(currentDate);
    });

    // 달, 일에 따라 날짜 이동
    $('#left').click(function() {
        $('#div-list').text('');
        $('#day').text('');
        if ($( '.nav-link' ).attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate()) - 1)
            generateCalendar(currentDate)
        }
    });

    $('#right').click(function(e) {
        $('#div-list').text('');
        $('#day').text('');
        if ($( '.nav-link' ).attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate()) + 1)
            generateCalendar(currentDate)
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
    generateCalendar(currentDate);

    // Toggle between d-day view and end date view when clicking the newly added button.
    $(document).on('click', '#toggleSummary', function() {
        toggle_d_day_status = !toggle_d_day_status;
        // Optionally update button text to reflect current mode
        $(this).text(toggle_d_day_status ? 'D-DAY' : '마감일');
        // Clear and re-generate the calendar (assuming currentDate is in scope)
        $('#div-list').html('');
        $('#day').html('');
        generateCalendar(currentDate);
    });

    // Toggle sorting between end_date and start_date
    $(document).on('click', '#toggleSort', function() {
        toggle_sort_mode = !toggle_sort_mode;
        $(this).text(toggle_sort_mode ? '마감일순' : '시작일순');
        // Re-generate the calendar (both month and day views) with the new sort order
        $('#div-list').html('');
        $('#day').html('');
        generateCalendar(currentDate);
    });

    // Update currentView when toggling between views
    $('#view li a').on('shown.bs.tab', function (e) {
        if (e.target.id === 'daily-tab') {
            currentView = 'daily';
        } else if (e.target.id === 'month-tab') {
            currentView = 'month';
        }
    });

    // New delegated event: Remove subtask row when '-' button is clicked
    $(document).on('click', '.remove-subtask', function() {
        $(this).closest('.subtask-item').remove();
        updateSubtaskProgress();
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