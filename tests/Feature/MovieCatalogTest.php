<?php

test('landing page can be rendered', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('movie catalog can be rendered with search filter', function () {
    $response = $this->get('/movies?search=Dune');

    $response->assertStatus(200);
});
