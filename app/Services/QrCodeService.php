<?php

namespace App\Services;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class QrCodeService
{
    /**
     * Generate an SVG string representation of the QR code.
     */
    public function generateSvg(string $data, int $size = 280): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size, 1),
            new SvgImageBackEnd
        );

        $writer = new Writer($renderer);

        return $writer->writeString($data);
    }

    /**
     * Generate a base64 encoded SVG data URI for direct <img src="..."> usage.
     */
    public function generateDataUri(string $data, int $size = 280): string
    {
        $svg = $this->generateSvg($data, $size);

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }
}
