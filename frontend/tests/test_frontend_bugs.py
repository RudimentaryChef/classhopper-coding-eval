"""Python-based tests for frontend TypeScript bugs."""
import pytest
import os


def test_phone_formatting_bug():
    """Test that phone formatting uses correct slice index (6 not 7)."""
    # Bug: normalizedInput.slice(7) should be slice(6)
    # This causes last digit to be cut off

    file_path = os.path.join(os.path.dirname(__file__), "../src/app/utils/functions.ts")
    with open(file_path, "r") as f:
        content = f.read()

    # Find the formatPhoneNumber function
    function_start = content.find("export function formatPhoneNumber")
    function_end = content.find("export function", function_start + 1)
    function_content = content[function_start:function_end]

    # Check for the bug: slice(7) instead of slice(6)
    assert ".slice(7)" not in function_content, \
        "Bug: Phone formatting uses slice(7) which cuts off last digit, should be slice(6)"

    # Verify correct implementation
    assert ".slice(6)" in function_content, \
        "Phone formatting should use slice(6) to include all digits"


def test_time_validation_bug():
    """Test that time validation uses correct boundary (> 59 not >= 59)."""
    # Bug: minutes >= 59 should be minutes > 59
    # This incorrectly rejects minute value of 59

    file_path = os.path.join(os.path.dirname(__file__), "../src/app/utils/functions.ts")
    with open(file_path, "r") as f:
        content = f.read()

    # Find the formatTime function
    function_start = content.find("export function formatTime")
    function_end = content.find("export function", function_start + 1)
    function_content = content[function_start:function_end]

    # Check for the bug: >= 59 instead of > 59
    assert "minutes >= 59" not in function_content, \
        "Bug: Time validation uses >= 59 which rejects valid minute 59, should be > 59"

    # Verify correct implementation
    assert "minutes > 59" in function_content, \
        "Time validation should use > 59 to accept minute value 59"


def test_stripe_amount_double_multiplication():
    """Test that Stripe amount is not multiplied by 100 twice."""
    # Bug: Math.round(Number(...) * 100) * 100
    # Should be: Math.round(Number(...) * 100)

    file_path = os.path.join(os.path.dirname(__file__), "../src/app/utils/stripeactions.ts")
    with open(file_path, "r") as f:
        content = f.read()

    # Find buyClassToPlatform function
    function_start = content.find("export async function buyClassToPlatform")
    function_end = content.find("export async function", function_start + 1)
    function_content = content[function_start:function_end]

    # Check for double multiplication bug
    # Pattern: * 100) * 100 or *100)*100
    assert "* 100) * 100" not in function_content and "*100)*100" not in function_content, \
        "Bug: Stripe amount multiplied by 100 twice, causing 100x overcharge"


def test_instructor_check_logic():
    """Test that instructor existence check uses res.data.length not instructor.length."""
    # Bug: instructor.length === 0 but instructor is res.data[0] (object not array)
    # Should check: res.data.length === 0

    file_path = os.path.join(os.path.dirname(__file__), "../src/app/utils/stripeactions.ts")
    with open(file_path, "r") as f:
        lines = f.readlines()

    # Find the section where instructor is assigned from res.data[0]
    found_bug = False
    for i, line in enumerate(lines):
        if "instructor = res.data[0]" in line:
            # Look ahead for instructor.length check (bug pattern)
            for j in range(i, min(i + 15, len(lines))):
                # After getting res.data[0], checking instructor.length is wrong
                if "instructor.length" in lines[j] and "res.data[0]" in line:
                    found_bug = True
                    break

    assert not found_bug, \
        "Bug: Checking instructor.length on object (res.data[0]), should check res.data.length instead"


def test_stripe_calculation_consistency():
    """Test that both Stripe functions use consistent calculation order."""
    # buyClassToPlatform and buyClassToInstructor should use same formula

    file_path = os.path.join(os.path.dirname(__file__), "../src/app/utils/stripeactions.ts")
    with open(file_path, "r") as f:
        content = f.read()

    # Find both functions
    platform_start = content.find("export async function buyClassToPlatform")
    platform_end = content.find("export async function buyClassToInstructor")
    platform_content = content[platform_start:platform_end]

    instructor_start = platform_end
    instructor_end = len(content)
    instructor_content = content[instructor_start:instructor_end]

    # Both should use same pattern: Math.round(Number(...) * 100)
    # Not: Math.round(Number(...)) * 100

    # Check that neither uses the wrong pattern
    wrong_pattern = "Math.round(Number(res.data.course_Price)) * 100"

    assert wrong_pattern not in platform_content, \
        "Bug: buyClassToPlatform uses inconsistent calculation (rounding before multiplication)"

    assert wrong_pattern not in instructor_content, \
        "Bug: buyClassToInstructor uses inconsistent calculation (rounding before multiplication)"
