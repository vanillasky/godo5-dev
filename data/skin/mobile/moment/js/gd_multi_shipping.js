var maxShippingNo = 10;
var changeElement = ['name', 'id', 'for'];

$(function(){
    $('input[name="multiShippingFl"]').click(function(){
        var checked = this.checked;

        if (checked === true) {
            $('#memberinfoApplyTr1, #memberinfoApplyTr2, #memberinfoApplyTr3').addClass('dn');
            $('#memberinfoApplyTr1, #memberinfoApplyTr3').find('input[name="reflectApplyMember"]').prop('checked', false);
            $('.shipping_add_btn, .select_goods_area').removeClass('dn');
            $('.shipping_add_btn').trigger('click');
        } else {
            $('#memberinfoApplyTr1, #memberinfoApplyTr2, #memberinfoApplyTr3').removeClass('dn');
            $('.select_goods').addClass('dn').find('table.check').empty();
            $('input[name^="selectGoods"]').val('');
            $('input[name^="multiDelivery"]').val(0);
            $('.shipping_add_btn, .select_goods, .select_goods_area').addClass('dn');
            $('.shipping_info_table').not(':eq(0)').remove();
        }

        gd_set_real_settle_price();

        resetMileage();
    });

    $(document).on('click', '.shipping_add_btn', function(){
        var shippingNo = $('.shipping_info_table').length;
        if (shippingNo >= maxShippingNo) {
            alert(__('복수 배송지는 최대 %s개까지 이용 가능합니다.', maxShippingNo));
            return;
        }
        var content = {'no': shippingNo};
        var compiled = _.template($('#multiShippingRow').html());
        compiled = compiled(content);

        $('.shipping_info_area').append(compiled);
    });

    $(document).on('click', '.shipping_remove_btn', function(){
        var index = $('.shipping_remove_btn').index(this) + 1;

        $(this).closest('.shipping_info_table').remove();

        if ($('.shipping_info_table').length <= 1) {
            $('input[name="multiShippingFl"]').trigger('click');
        } else {
            for (var i = $('.shipping_info_table').length; i > index; i--) {
                $('.shipping_info_table:eq(' + (i - 1) + ') h2.my_tit:eq(0) span.no').html(i - 1);
                $('.shipping_info_table:eq(' + (i - 1) + ')').find('input, select, label, button').each(function (index, element) {
                    changeElement.forEach(function (ele) {
                        if (typeof $(element).prop(ele) != 'undefined') {
                            if (ele == 'name') {
                                var replace = $(element).prop(ele).replace(/\[.*\]/gi, '[' + (i - 1) + ']');
                            } else {
                                var replace = $(element).prop(ele).replace(/Add\d/gi, 'Add' + (i - 1));
                            }
                            $(element).prop(ele, replace);
                        }
                    });
                    if (typeof $(element).data('no') != 'undefined') {
                        $(element).attr('data-no', (i - 1));
                    }
                });
            }
        }

        gd_set_real_settle_price();
    });

    $(document).on('click', '.postcode_search', function(){
        var no = $(this).attr('data-no');
        gd_postcode_search('shippingZonecodeAdd[' + no + ']', 'shippingAddressAdd[' + no + ']', 'shippingZipcodeAdd[' + no + ']');
    });

    $(document).on('click', 'button.delete_goods', function(){
        var $target = $(this);console.log($target);
        var type = $target.data('type');
        var cartSno = $target.data('cart-sno');
        var goodsNo = $target.data('goods-no');
        var selectGoods = $target.closest('.select_goods_area').find('input[name^="selectGoods"]').val();

        switch (type) {
            case 'goods':
                var addgoodsCnt = $target.closest('table').find('button.delete_goods[data-type="addGoods"][data-parent-goods-no="' + goodsNo + '"]').length;

                if (addgoodsCnt > 0) {
                    alert(__('추가상품만 단독으로 배송지 선택은 불가합니다.'));
                    return false;
                }
                break;
            case 'addGoods':
                if ($target.data('must-fl') == 'y') {
                    alert(__('추가상품이 필수 선택인 상품이 있습니다. 추가상품도 함께 선택하셔야 배송지 선택이 가능합니다.'));
                    return false;
                }
                break;
        }

        var totalGoodsCnt = 0;
        var setData = [];
        $.parseJSON(selectGoods).forEach(function(ele){
            if (ele.sno == cartSno) {
                if (type == 'goods') {
                    ele.goodsCnt = 0;
                } else {
                    ele.addGoodsNo.forEach(function(addGoodsNo, index){
                        if (addGoodsNo == goodsNo) {
                            ele.addGoodsCnt[index] = 0;
                        }
                    });
                }
            }
            totalGoodsCnt += parseInt(ele.goodsCnt);
            setData.push(ele);
        });
        var data = JSON.stringify(setData);

        if (totalGoodsCnt > 0) {
            $.ajax({
                method: "POST",
                url: "../order/cart_ps.php",
                data: {mode: 'multi_shipping_delivery', selectGoods: data}
            }).success(function (getData) {
                $target.closest('.select_goods_area').find('input[name^="multiDelivery"]').val(getData.deliveryCharge);
                $target.closest('.select_goods_area').find('input[name^="selectGoods"]').val(data);
                $target.closest('tr').remove();
            });
        } else {
            $target.closest('.select_goods').addClass('dn');
            $target.closest('.select_goods-area').find('input[name^="selectGoods"]').val('');
            $target.closest('.select_goods-area').find('input[name^="multiDelivery"]').val(0);
            $target.closest('table').empty();
        }

        gd_set_real_settle_price();
    });

    // 레이어 오픈 바인딩
    $(document).on('click', '.shipping_goods_select', function (e) {
        var shippingNo = $('.shipping_goods_select').index(this);
        var cartIdx = [];
        var selectGoods = [];
        var address = '';
        $(this).closest('form').find('input[name="cartSno[]"]').each(function(){
            cartIdx.push($(this).val());
        });
        $('input[name^="selectGoods"]').each(function(index){
            selectGoods.push(this.value);
        });
        if (shippingNo > 0) {
            address = $('input[name="shippingAddressAdd[' + shippingNo + ']"]').val()+$('input[name="shippingAddressSubAdd[' + shippingNo + ']"]').val();
        } else {
            if (!$('input[name="tmpDeliverTab"]').val() || $('input[name="tmpDeliverTab"]').val() == 'receiver') {
                address = $('input[name="receiverAddress"]').val()+$('input[name="receiverAddressSub"]').val();
            } else if ($('input[name="tmpDeliverTab"]').val() == 'shipping') {
                address = $('input[name="shippingAddress"]').val()+$('input[name="shippingAddressSub"]').val();
            } else if ($('input[name="tmpDeliverTab"]').val() == 'direct') {
                address = $('input[name="directAddress"]').val()+$('input[name="directAddressSub"]').val();
            }
        }

        var params = {
            shippingNo: shippingNo,
            cartIdx: cartIdx,
            selectGoods: selectGoods,
            address: address,
            multiDelivery: $('input[name="multiDelivery[' + shippingNo + ']"]').val()
        };

        $('#popupShippingGoodsSelect').modal({
            remote: '../order/shipping_goods_select.php',
            cache: false,
            type : 'post',
            params: params,
            show: true
        });
    });

    $(document).on('click', '.tab_menu li a[href*="#tab"]', function(e) {
        if ($('input[name="multiShippingFl"]').prop('checked') === true) {
            var href = $(this).attr('href');
            var shippingNo = $('.tab_btn > a[href="' + href + '"]').index(this);

            if (shippingNo > 0) {
                switch (href) {
                    case '#tab2':
                        var self = $($(this).attr('href'));
                        var params = {
                            mode: 'shipping_list'
                        };
                        self.addClass('loading');
                        $(this).closest('.tab_menu').find('.tab_btn').eq(0).addClass('active');
                        $(this).closest('.tab_menu').find('.tab_btn').eq(1).removeClass('active');
                        $.post('../order/order_ps.php', params, function (data) {
                            deliveryList = data;
                            $('.delivery_list_add').eq(shippingNo).empty().append('<li><a href="../mypage/layer_shipping_address_regist.php?type=order_regist&shippingNo=' + shippingNo + '" data-toggle="modal" data-target="#popupShipping" data-type="post" data-cache="false" class="dellvery_add_btn">배송지 추가</a></li>');
                            $('.delivery_list').eq(shippingNo).empty();
                            self.removeClass('loading');
                            if (data.length > 0) {
                                $.each(data, function(idx){
                                    var json = $(this)[0];
                                    $('.delivery_list_add').eq(shippingNo).append('<li class="btn_shipping_receiver" data-shipping-no="' + shippingNo + '"><a data-sno="' + json.sno + '" class="dellvery_list_btn">' + json.shippingTitle + '</a></li>');
                                    if (idx === 0) {
                                        gd_insert_shipping_data(json, shippingNo);
                                    }
                                });
                            } else {
                                $('.delivery_list').eq(shippingNo).empty().append('<div class="no-shipping"><b>등록된 기본배송지가 없습니다.</b><br />(기본배송지는 "배송지 목록"에서 추가할 수 있습니다.)</div>');
                            }
                        });
                        break;
                    case '#tab3':
                        $('input[name="shippingNameAdd[' + shippingNo + ']"]').val('');
                        $('input[name="shippingZonecodeAdd[' + shippingNo + ']"]').val('');
                        $('input[name="shippingZipcodeAdd[' + shippingNo + ']"]').val('');
                        $('input[name="shippingAddressAdd[' + shippingNo + ']"]').val('');
                        $('input[name="shippingAddressSubAdd[' + shippingNo + ']"]').val('');
                        $('input[name="reflectApplyDeliveryAdd[' + shippingNo + ']"]').prop('checked', false);
                        $('input[name="shippingPhoneAdd[' + shippingNo + ']"]').val('');
                        $('input[name="shippingCellPhoneAdd[' + shippingNo + ']"]').val('');
                        $('.delivery_list_add').eq(shippingNo).empty();
                        $('.delivery_list').eq(shippingNo).empty();
                        $(this).closest('.tab_menu').find('.tab_btn').eq(0).removeClass('active');
                        $(this).closest('.tab_menu').find('.tab_btn').eq(1).addClass('active');
                        break;
                }
            }
        }
    });
});
